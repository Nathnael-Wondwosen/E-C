import MarketplacePage, { getServerSideProps as getMarketplaceServerSideProps } from './marketplace';

export default function BestSellersPage(props) {
  return <MarketplacePage {...props} initialBestSellerView initialIsLocalMarketView initialSort="rating" />;
}

export async function getServerSideProps(context) {
  const result = await getMarketplaceServerSideProps(context);
  if (!result?.props) return result;

  return {
    ...result,
    props: {
      ...result.props,
      initialBestSellerView: true,
      initialIsLocalMarketView: true,
      initialSort: 'rating',
    },
  };
}
