import * as XLSX from "xlsx";
import { useEffect, useState } from "react";

const ExcelViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [data, setData] = useState<any[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!fileUrl) {
          setError("No file URL provided");
          return;
        }

        console.log("Loading Excel from:", fileUrl);

        const token = localStorage.getItem("token");
        const res = await fetch(fileUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          console.error("Excel HTTP status:", res.status);
          throw new Error(`Failed to load Excel file (status ${res.status})`);
        }

        const buffer = await res.arrayBuffer();

        const workbook = XLSX.read(buffer, { type: "array" });

        console.log("Sheet names:", workbook.SheetNames);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
          setError("No sheets found in Excel file");
          return;
        }

        const json = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
        }) as any[][];

        console.log("Excel rows count:", json.length);

        setData(json);
      } catch (err) {
        console.error("Excel load failed", err);
        setError("Failed to load Excel file");
      } finally {
        setLoading(false);
      }
    };

    if (fileUrl) loadExcel();
  }, [fileUrl]);

  if (loading) return <p>Loading Excel preview...</p>;
  if (error) return <p>{error}</p>;
  if (!data.length) return <p>No data found in Excel file</p>;

  return (
    <div style={{ overflowX: "auto", padding: "8px" }}>
      <table border={1} cellPadding={6}>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelViewer;
