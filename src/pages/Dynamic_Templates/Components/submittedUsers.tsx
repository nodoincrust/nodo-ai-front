import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification, Tooltip } from "antd";
import dayjs from "dayjs";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { getTemplateSubmissions } from "../../../services/templates.services";
import { MESSAGES } from "../../../utils/Messages";
import "./Styles/SubmittedUsers.scss";

interface SubmissionItem {
  submissionId: number;
  submittedBy: string;
  submitedUserID: number;
  submittedAt: string;
}

interface SubmissionsResponse {
  statusCode: number;
  templateId: number;
  totalsubmissions: number;
  data: SubmissionItem[];
}

export default function SubmittedUsers() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSubmissions = async () => {
    if (!templateId) return;
    getLoaderControl()?.showLoader();
    try {
      const res: SubmissionsResponse = await getTemplateSubmissions(templateId);
      if (res?.statusCode === 200 && Array.isArray(res.data)) {
        setSubmissions(res.data);
      } else {
        setSubmissions([]);
        if (res?.statusCode !== 200) {
          notification.error({ message: "Failed to load submissions" });
        }
      }
    } catch (error: any) {
      setSubmissions([]);
      notification.error({
        message:
          error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [templateId]);

  const totalRecords = submissions.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = submissions.slice(startIndex, startIndex + pageSize);

  const handleViewSubmission = (row: SubmissionItem) => {
    // Placeholder for future detailed view implementation
    notification.info({
      message: "View submission",
      description: `Submission ID: ${row.submissionId}`,
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return dayjs(dateStr).format("DD MMM YYYY, HH:mm");
    } catch {
      return dateStr;
    }
  };

  if (!templateId) {
    navigate("/templates");
    return null;
  }

  return (
    <div className="submitted-users-container">
      <Header
        breadcrumb={{
          parent: "Templates",
          current: "Submitted users",
          parentPath: "/templates",
        }}
        count={`${totalRecords} Submission${totalRecords !== 1 ? "s" : ""}`}
      />

      <Table
        data={paginatedData}
        columns={[
          {
            title: "Sr.No",
            render: (_row: SubmissionItem, idx?: number) => (
              <span className="submitted-users-srno">
                {startIndex + (idx ?? 0) + 1}
              </span>
            ),
          },
          {
            title: "User Name",
            render: (row: SubmissionItem) => (
              <span className="submitted-users-name">{row.submittedBy || "—"}</span>
            ),
          },
          {
            title: "Submitted Date",
            render: (row: SubmissionItem) => (
              <span className="submitted-users-date">
                {row.submittedAt ? formatDate(row.submittedAt) : "—"}
              </span>
            ),
          },
        ]}
        actions={(row: SubmissionItem) => (
            <Tooltip title="View Reponse">
          <div className="submitted-users-actions">
            <img
              src="/assets/Eye.svg"
              alt="View submission"
              title="View submission"
              onClick={() => handleViewSubmission(row)}
            />
          </div>
          </Tooltip>
        )}
        actionsTitle="Actions"
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(newSize: number) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        emptyText="No submissions found"
      />
    </div>
  );
}
