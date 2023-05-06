import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useFetchCollectionDetails() {
  const { data, error } = useSWR(`/api/fetchCollectionDetails`, fetcher);

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  };
}
