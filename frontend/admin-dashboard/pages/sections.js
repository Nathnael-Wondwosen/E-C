import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

const sectionTools = [
  {
    name: 'Hero Carousel',
    description: 'Manage homepage hero slides and primary call-to-action content.',
    href: '/sections/hero-carousel',
    category: 'Homepage'
  },
  {
    name: 'Category Slider',
    description: 'Control category showcase content and ordering.',
    href: '/sections/category-slider',
    category: 'Homepage'
  },
  {
    name: 'Special Offers',
    description: 'Publish and manage promotional offer cards.',
    href: '/sections/special-offers',
    category: 'Promotions'
  },
  {
    name: 'News and Blog',
    description: 'Edit newsroom and blog section content.',
    href: '/sections/news-blog',
    category: 'Content'
  },
  {
    name: 'Full Width Banners',
    description: 'Manage wide promotional banners used across the storefront.',
    href: '/banners',
    category: 'Promotions'
  },
  {
    name: 'Partners',
    description: 'Manage partner logos, ordering, and display state.',
    href: '/partners',
    category: 'Content'
  },
  {
    name: 'Services',
    description: 'Manage service cards shown on the customer portal.',
    href: '/services',
    category: 'Content'
  }
];

export default function PageSectionsManagement() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    }
  }, [router]);

  return (
    <AdminLayout title="Sections Management">
      <Head>
        <title>Sections Management | Admin Dashboard</title>
        <meta
          name="description"
          content="Manage homepage sections and content modules for the customer portal."
        />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sections Management</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
              Use the dedicated tools below to manage real homepage and merchandising sections. This page is the operational hub, not a local-only preview.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sectionTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="block rounded-none border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {tool.category}
                </p>
                <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                <div className="mt-5 text-sm font-medium text-blue-600 dark:text-blue-400">Open manager</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
