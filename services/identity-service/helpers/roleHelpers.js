const normalizeRole = (rawRole) => {
  const role = (rawRole || '').trim();
  const map = {
    admin: 'admin',
    HR: 'hr',
    hr: 'hr',
    sales: 'sales',
    salesmanager: 'sales_manager',
    customerservice: 'customer_service',
    CustomerSuccessManager: 'customer_success_manager',
    SocialmediaManager: 'social_media_manager',
    IT: 'it',
    it: 'it',
    Instructor: 'instructor',
    instructor: 'instructor',
    supervisor: 'supervisor',
    finance: 'finance',
    reception: 'reception',
    COO: 'coo',
    tradextv: 'tradex_tv',
    TradeXTV: 'tradex_tv',
    TETV: 'tradex_tv',
    Enisra: 'enisra',
    enisra: 'enisra',
    EventManager: 'event_manager'
  };

  return map[role] || (role ? role.toLowerCase() : 'buyer');
};

module.exports = {
  normalizeRole
};
