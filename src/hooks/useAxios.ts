import { useState, useEffect } from 'react';
import axios from 'axios';

export interface UseAxiosParams {
  url: string,
  params?: object,
  headers?: object
}

export function useAxios (inParams: UseAxiosParams) {

    const {
      url,
      params = {},
      headers = {}
    } = inParams;

    const [ data, setData] = useState( [] );
    const [ error, setError ] = useState( null );
    const [ loading, setLoading ] = useState( true );

    useEffect(() => {
      const request = () => {
        axios.get(url, { params, headers })
         .then((res: any) =>  setData(res.data))
         .catch((err: any) => setError(err))
         .finally(() => setLoading(false));
      };

      request();

    }, [  url, params, headers ]);

    return { data, error, loading };
};

export default useAxios;
