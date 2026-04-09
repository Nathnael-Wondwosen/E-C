// services/api-gateway/services/InquiryService.js
// Product inquiry management service

const { ApiError } = require('../middleware/errorHandler');

class InquiryService {
  constructor(inquiryRepository, productRepository, userRepository, identityUserRepository) {
    this.inquiryRepository = inquiryRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.identityUserRepository = identityUserRepository;
  }

  async findUserAny(userId) {
    const legacyUser = await this.userRepository.findById(userId);
    if (legacyUser) return legacyUser;
    if (this.identityUserRepository) {
      return this.identityUserRepository.findById(userId);
    }
    return null;
  }

  /**
   * Create a new product inquiry
   * @param {Object} inquiryData - Inquiry data
   * @returns {Promise}
   */
  async createInquiry(inquiryData) {
    try {
      const { productId, buyerId, message, subject, supplierId } = inquiryData;

      if (!productId || !buyerId || !message) {
        throw new ApiError('Product ID, buyer ID, and message are required', 400);
      }

      // Verify product exists and get seller
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new ApiError('Product not found', 404);
      }

      // Verify buyer exists
      const buyer = await this.findUserAny(buyerId);
      if (!buyer) {
        throw new ApiError('Buyer not found', 404);
      }

      // Create inquiry
      const resolvedSellerId = String(
        supplierId ||
        product.supplierId ||
        product.companyId ||
        product.ownerId ||
        product.sellerId ||
        product.createdBy ||
        ''
      );

      if (!resolvedSellerId) {
        throw new ApiError('This product is missing owner mapping', 400);
      }

      if (resolvedSellerId === String(buyerId)) {
        throw new ApiError('You cannot send an inquiry to your own product', 400);
      }

      const normalizedProductId = String(productId || '').trim();
      const threadKey = this.inquiryRepository.buildThreadKey(normalizedProductId, String(buyerId), resolvedSellerId);
      const initialMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        senderId: String(buyerId),
        senderRole: 'buyer',
        text: String(message).trim(),
        createdAt: new Date()
      };

      const createdAt = new Date();
      const existingThread = await this.inquiryRepository.findThreadByParticipantsAndProduct(
        normalizedProductId,
        String(buyerId),
        resolvedSellerId
      );

      if (existingThread) {
        const followupMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          senderId: String(buyerId),
          senderRole: 'buyer',
          text: String(message).trim(),
          createdAt
        };

        await this.inquiryRepository.addMessage(existingThread._id, followupMessage);
        await this.inquiryRepository.updateById(existingThread._id, {
          ...(existingThread.threadKey ? {} : { threadKey }),
          status: String(existingThread.status || '').toLowerCase() === 'closed' ? 'contacted' : (existingThread.status || 'new'),
          quantity: Math.max(1, Math.floor(Number(inquiryData.quantity) || 1)),
          subject: subject || existingThread.subject || `Inquiry about ${product.name}`,
          updatedAt: createdAt
        });
        await this.inquiryRepository.markAsRead(existingThread._id, String(buyerId), createdAt);

        const refreshed = await this.inquiryRepository.findById(existingThread._id);
        const enriched = await this.enrichInquiryWithDetails(refreshed || existingThread, String(buyerId));
        return {
          success: true,
          inquiry: enriched,
          message: 'Message sent in existing inquiry thread'
        };
      }

      let inquiry;
      try {
        inquiry = await this.inquiryRepository.create({
          productId: normalizedProductId,
          productName: product.name || '',
          buyerId,
          fromUserId: String(buyerId),
          sellerId: resolvedSellerId,
          toUserId: resolvedSellerId,
          threadKey,
          quantity: Math.max(1, Math.floor(Number(inquiryData.quantity) || 1)),
          subject: subject || `Inquiry about ${product.name}`,
          message: initialMessage.text,
          messages: [initialMessage],
          lastReadAtByUser: {
            [String(buyerId)]: createdAt
          },
          status: 'new',
          createdAt,
          updatedAt: createdAt
        });
      } catch (createError) {
        if (createError?.code === 11000 || /E11000 duplicate key/i.test(String(createError?.message || ''))) {
          const concurrentThread = await this.inquiryRepository.findThreadByParticipantsAndProduct(
            normalizedProductId,
            String(buyerId),
            resolvedSellerId
          );
          if (concurrentThread) {
            const followupMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              senderId: String(buyerId),
              senderRole: 'buyer',
              text: String(message).trim(),
              createdAt
            };
            await this.inquiryRepository.addMessage(concurrentThread._id, followupMessage);
            await this.inquiryRepository.updateById(concurrentThread._id, {
              ...(concurrentThread.threadKey ? {} : { threadKey }),
              status: String(concurrentThread.status || '').toLowerCase() === 'closed' ? 'contacted' : (concurrentThread.status || 'new'),
              updatedAt: createdAt
            });
            await this.inquiryRepository.markAsRead(concurrentThread._id, String(buyerId), createdAt);
            const refreshedConcurrent = await this.inquiryRepository.findById(concurrentThread._id);
            const enrichedConcurrent = await this.enrichInquiryWithDetails(refreshedConcurrent || concurrentThread, String(buyerId));
            return {
              success: true,
              inquiry: enrichedConcurrent,
              message: 'Message sent in existing inquiry thread'
            };
          }
        }
        throw createError;
      }

      return {
        success: true,
        inquiry: this.normalizeInquiry(inquiry, String(buyerId)),
        message: 'Inquiry sent successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to create inquiry: ${error.message}`, 500);
    }
  }

  /**
   * Get user's inbox inquiries (received as seller)
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  async getInboxInquiries(userId) {
    try {
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      const inquiryResult = await this.inquiryRepository.findBySellerId(userId);
      const inquiries = Array.isArray(inquiryResult)
        ? inquiryResult
        : Array.isArray(inquiryResult?.documents)
          ? inquiryResult.documents
          : [];
      const enrichedInquiries = await this.enrichInquiriesWithDetails(inquiries, String(userId));

      return {
        inquiries: enrichedInquiries,
        total: enrichedInquiries.length,
        unreadTotal: enrichedInquiries.reduce((sum, item) => sum + Number(item?.unreadCount || 0), 0)
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to get inbox inquiries: ${error.message}`, 500);
    }
  }

  /**
   * Get user's sent inquiries (sent as buyer)
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  async getSentInquiries(userId) {
    try {
      if (!userId) {
        throw new ApiError('User ID is required', 400);
      }

      const inquiryResult = await this.inquiryRepository.findByBuyerId(userId);
      const inquiries = Array.isArray(inquiryResult)
        ? inquiryResult
        : Array.isArray(inquiryResult?.documents)
          ? inquiryResult.documents
          : [];
      const enrichedInquiries = await this.enrichInquiriesWithDetails(inquiries, String(userId));

      return {
        inquiries: enrichedInquiries,
        total: enrichedInquiries.length,
        unreadTotal: enrichedInquiries.reduce((sum, item) => sum + Number(item?.unreadCount || 0), 0)
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to get sent inquiries: ${error.message}`, 500);
    }
  }

  /**
   * Update inquiry status
   * @param {string} inquiryId - Inquiry ID
   * @param {string} userId - User ID (must be seller)
   * @param {string} status - New status
   * @returns {Promise}
   */
  async updateInquiryStatus(inquiryId, userId, status) {
    try {
      if (!inquiryId || !userId || !status) {
        throw new ApiError('Inquiry ID, user ID, and status are required', 400);
      }

      const validStatuses = ['new', 'contacted', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new ApiError('Invalid status. Must be: new, contacted, or closed', 400);
      }

      // Get inquiry and verify ownership
      const inquiry = await this.inquiryRepository.findById(inquiryId);
      if (!inquiry) {
        throw new ApiError('Inquiry not found', 404);
      }

      const ownerId = String(inquiry.sellerId || inquiry.toUserId || '');
      if (ownerId !== String(userId)) {
        throw new ApiError('Unauthorized to update this inquiry', 403);
      }

      // Update status
      const updatedInquiry = await this.inquiryRepository.updateById(inquiryId, {
        status,
        updatedAt: new Date()
      });

      const enrichedInquiry = await this.enrichInquiryWithDetails(updatedInquiry, String(userId));

      return {
        success: true,
        inquiry: enrichedInquiry,
        message: `Inquiry status updated to ${status}`
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to update inquiry status: ${error.message}`, 500);
    }
  }

  async addInquiryMessage(inquiryId, userId, text) {
    try {
      const normalizedText = String(text || '').trim();
      if (!inquiryId || !userId || !normalizedText) {
        throw new ApiError('Inquiry ID, user ID, and message are required', 400);
      }

      const inquiry = await this.inquiryRepository.findById(inquiryId);
      if (!inquiry) {
        throw new ApiError('Inquiry not found', 404);
      }

      const buyerId = String(inquiry.buyerId || inquiry.fromUserId || '');
      const sellerId = String(inquiry.sellerId || inquiry.toUserId || '');
      const senderId = String(userId);
      if (senderId !== buyerId && senderId !== sellerId) {
        throw new ApiError('Unauthorized to reply to this inquiry', 403);
      }

      const senderRole = senderId === sellerId ? 'seller' : 'buyer';
      const nextStatus =
        senderRole === 'seller' && String(inquiry.status || 'new').toLowerCase() === 'new'
          ? 'contacted'
          : inquiry.status || 'new';

      const messageDoc = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        senderId,
        senderRole,
        text: normalizedText,
        createdAt: new Date()
      };
      const normalizedProductId = String(inquiry.productId || '').trim();
      const threadKey = this.inquiryRepository.buildThreadKey(normalizedProductId, buyerId, sellerId);

      const updatedInquiry = await this.inquiryRepository.addMessage(inquiryId, messageDoc);
      await this.inquiryRepository.updateById(inquiryId, {
        ...(inquiry.threadKey ? {} : (threadKey ? { threadKey } : {})),
        status: nextStatus,
        updatedAt: new Date()
      });
      await this.inquiryRepository.markAsRead(inquiryId, senderId, new Date());
      const refreshed = await this.inquiryRepository.findById(inquiryId);
      const enrichedInquiry = await this.enrichInquiryWithDetails(refreshed || updatedInquiry, senderId);

      return {
        success: true,
        inquiry: enrichedInquiry,
        message: 'Reply sent successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to send inquiry reply: ${error.message}`, 500);
    }
  }

  async markInquiryAsRead(inquiryId, userId) {
    try {
      if (!inquiryId || !userId) {
        throw new ApiError('Inquiry ID and user ID are required', 400);
      }

      const inquiry = await this.inquiryRepository.findById(inquiryId);
      if (!inquiry) {
        throw new ApiError('Inquiry not found', 404);
      }

      const buyerId = String(inquiry.buyerId || inquiry.fromUserId || '');
      const sellerId = String(inquiry.sellerId || inquiry.toUserId || '');
      const viewerId = String(userId);
      if (viewerId !== buyerId && viewerId !== sellerId) {
        throw new ApiError('Unauthorized to access this inquiry', 403);
      }

      const updated = await this.inquiryRepository.markAsRead(inquiryId, viewerId, new Date());
      const enrichedInquiry = await this.enrichInquiryWithDetails(updated || inquiry, viewerId);
      return {
        success: true,
        inquiry: enrichedInquiry,
        message: 'Inquiry marked as read'
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to mark inquiry as read: ${error.message}`, 500);
    }
  }

  getUnreadCountForUser(inquiry, viewerId) {
    const normalizedViewerId = String(viewerId || '').trim();
    if (!normalizedViewerId) return 0;

    const messages = Array.isArray(inquiry?.messages) ? inquiry.messages : [];
    const lastReadAtByUser = inquiry?.lastReadAtByUser && typeof inquiry.lastReadAtByUser === 'object'
      ? inquiry.lastReadAtByUser
      : {};
    const rawLastRead = lastReadAtByUser[normalizedViewerId];
    const lastReadAt = rawLastRead ? new Date(rawLastRead) : null;
    const lastReadTs = lastReadAt && !Number.isNaN(lastReadAt.getTime()) ? lastReadAt.getTime() : 0;

    return messages.reduce((sum, item) => {
      const senderId = String(item?.senderId || '').trim();
      if (!senderId || senderId === normalizedViewerId) return sum;
      const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
      const createdTs = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.getTime() : 0;
      return createdTs > lastReadTs ? sum + 1 : sum;
    }, 0);
  }

  /**
   * Enrich inquiries with product and user details
   * @private
   */
  async enrichInquiriesWithDetails(inquiries, viewerId = '') {
    const source = Array.isArray(inquiries) ? inquiries : [];
    const enriched = [];
    for (const inquiry of source) {
      enriched.push(await this.enrichInquiryWithDetails(inquiry, viewerId));
    }
    return enriched;
  }

  /**
   * Enrich single inquiry with product and user details
   * @private
   */
  async enrichInquiryWithDetails(inquiry, viewerId = '') {
    const [product, buyer, seller] = await Promise.all([
      this.productRepository.findById(inquiry.productId),
      this.findUserAny(inquiry.buyerId || inquiry.fromUserId),
      this.findUserAny(inquiry.sellerId || inquiry.toUserId)
    ]);

    const toUserSummary = (userDoc) => {
      if (!userDoc) return null;
      const resolvedId = String(userDoc?._id || userDoc?.id || '').trim();
      return {
        id: resolvedId,
        name: userDoc?.name || userDoc?.displayName || userDoc?.profile?.name || '',
        email: userDoc?.email || userDoc?.profile?.email || '',
        phone: userDoc?.phone || userDoc?.profile?.phone || '',
      };
    };

    return {
      ...this.normalizeInquiry(inquiry, viewerId),
      product: product ? {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        images: product.images
      } : null,
      buyer: toUserSummary(buyer),
      seller: toUserSummary(seller),
    };
  }

  /**
   * Normalize inquiry response
   * @private
   */
  normalizeInquiry(inquiry, viewerId = '') {
    const unreadCount = this.getUnreadCountForUser(inquiry, viewerId);
    return {
      id: inquiry._id.toString(),
      productId: inquiry.productId,
      productName: inquiry.productName || '',
      buyerId: inquiry.buyerId || inquiry.fromUserId,
      fromUserId: inquiry.fromUserId || inquiry.buyerId,
      sellerId: inquiry.sellerId || inquiry.toUserId,
      toUserId: inquiry.toUserId || inquiry.sellerId,
      threadKey: inquiry.threadKey || '',
      quantity: Number(inquiry.quantity || 1),
      subject: inquiry.subject,
      message: inquiry.message,
      messages: Array.isArray(inquiry.messages)
        ? inquiry.messages
            .map((item) => ({
              id: item?.id || '',
              senderId: String(item?.senderId || ''),
              senderRole: item?.senderRole || '',
              text: item?.text || '',
              createdAt: item?.createdAt || null
            }))
            .filter((item) => item.text)
        : [],
      status: inquiry.status,
      unreadCount,
      lastReadAt: inquiry?.lastReadAtByUser?.[String(viewerId || '').trim()] || null,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt
    };
  }
}

module.exports = InquiryService;
