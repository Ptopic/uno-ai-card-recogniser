'use client';

import { ReactNode, useState } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClientDefaultOptions } from '@shared/queryClient';

interface IProps {
  children: ReactNode;
}

const ReactQueryProvider = ({ children }: IProps) => {
  const [client] = useState(
    () => new QueryClient({ ...queryClientDefaultOptions }),
  );

  const dehydratedState = dehydrate(client, {
    shouldDehydrateQuery: () => true,
  });

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
