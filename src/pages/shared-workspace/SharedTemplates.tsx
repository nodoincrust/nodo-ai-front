import { Tooltip } from "antd";
import Table from "../../CommonComponents/Table/Components/Table";
import "./Styles/SharedTemplates.scss";

export interface SharedTemplate {
  id: number;
  templateName: string;
  shared_by?: string;
  shared_at?: string;
}

interface SharedTemplatesProps {
  data: SharedTemplate[];
  count: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewTemplate: (template: SharedTemplate) => void;
}

export default function SharedTemplates({
  data,
  count,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewTemplate,
}: SharedTemplatesProps) {
  const columns = [
    {
      title: "SR.NO",
      render: (_row: SharedTemplate, index = 0) =>
        String((currentPage - 1) * pageSize + index + 1).padStart(2, "0"),
    },
    {
      title: "TEMPLATE NAME",
      render: (row: SharedTemplate) => (
        <span className="template-name">{row.templateName || "—"}</span>
      ),
    },
    {
      title: "SHARED BY",
      render: (row: SharedTemplate) => (
        <span>{row.shared_by || "—"}</span>
      ),
    },
  ];

  return (
    <div className="shared-templates-table">
      <Table<SharedTemplate>
        data={data}
        columns={columns}
        actions={(row) => (
          <div className="shared-workspace-actions">
            <Tooltip title="View Template" placement="top">
              <img
                src="/assets/Eye.svg"
                alt="View"
                onClick={() => onViewTemplate(row)}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
          </div>
        )}
        actionsTitle="ACTION"
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize) || 1}
        onPageChange={onPageChange}
        pageSize={pageSize}
        totalRecords={count}
        onPageSizeChange={onPageSizeChange}
        emptyText="No shared templates found"
      />
    </div>
  );
}
