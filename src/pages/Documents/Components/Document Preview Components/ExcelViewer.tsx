import * as XLSX from "xlsx";
import { useEffect, useState } from "react";

interface ExcelViewerProps {
  fileUrl: string;
}

const ExcelViewer = ({ fileUrl }: ExcelViewerProps) => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
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

        const token = localStorage.getItem("token");
        const res = await fetch(fileUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Failed to load Excel");

        const buffer = await res.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        if (!wb.SheetNames.length) {
          setError("No sheets found");
          return;
        }

        setWorkbook(wb);
        setSheetNames(wb.SheetNames);

        const first = wb.SheetNames[0];
        setActiveSheet(first);
        loadSheetData(wb, first);
      } catch (err) {
        setError("Failed to load Excel file");
      } finally {
        setLoading(false);
      }
    };

    loadExcel();
  }, [fileUrl]);

  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;

    const json = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
    }) as any[][];

    setData(json);
  };

  const handleSheetChange = (name: string) => {
    if (!workbook) return;
    setActiveSheet(name);
    loadSheetData(workbook, name);
  };

  if (loading) return <p>Loading Excel preview...</p>;
  if (error) return <p>{error}</p>;
  if (!data.length) return <p>No data found</p>;

  return (
    <div style={{ width: "100%" }}>
      {/* Sheet Tabs */}
      {sheetNames.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            whiteSpace: "nowrap",
            paddingBottom: 4,
            marginBottom: 6,
          }}
        >
          {sheetNames.map((name) => (
            <button
              key={name}
              onClick={() => handleSheetChange(name)}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                borderRadius: 3,
                border: "1px solid #d9d9d9",
                backgroundColor:
                  activeSheet === name ? "#1677ff" : "#f5f5f5",
                color: activeSheet === name ? "#fff" : "#000",
                cursor: "pointer",
                flexShrink: 0, // 👈 prevents squeezing
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
            fontSize: 13,
          }}
        >
          <tbody style={{ background: "#ffffff" }}>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={
                  rowIndex === 0
                    ? {
                        fontWeight: 600,
                        background: "#ffffff",
                      }
                    : {}
                }
              >
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      border: "1px solid #d9d9d9",
                      padding: "4px 6px",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      verticalAlign: "top",
                    }}
                  >
                    {cell ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelViewer;
