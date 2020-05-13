import DataService from "../modules/data-service";
import { useEffect, useState } from "react";

const db = new DataService(
  process.env.REACT_APP_DB_AUTH_TOKEN,
  process.env.REACT_APP_DB_URL
);

export default function useDataService (collection: string, id?: string) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        setData(
          await db.get(collection, id)
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [collection, id]);

  return {
    error,
    loading,
    data,
  }
}