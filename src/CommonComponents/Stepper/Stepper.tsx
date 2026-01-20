import { Steps, Tag } from "antd";
import dayjs from "dayjs";
import "./Styles/Stepper.scss";

const { Step } = Steps;

type StepStatus = "APPROVED" | "REJECTED" | "PENDING";

interface StepItem {
    role: string;
    status: StepStatus;
    display: string;
    timestamp?: string;
}

interface Props {
    steps: StepItem[];
}

const formatStatusLabel = (status: StepStatus) =>
    `${status.charAt(0)}${status.slice(1).toLowerCase()}`;

const getStatusClass = (status: StepStatus) => {
    switch (status) {
        case "APPROVED":
            return "approved";
        case "REJECTED":
            return "rejected";
        default:
            return "pending";
    }
};

const getAntStatus = (status: StepStatus): "finish" | "error" | "process" => {
    switch (status) {
        case "APPROVED":
            return "finish";
        case "REJECTED":
            return "error";
        default:
            return "process";
    }
};

const getStepIcon = (status: StepStatus) => {
    const iconMap: Record<StepStatus, string> = {
        APPROVED: "/assets/approve.svg",
        REJECTED: "/assets/reject.svg",
        PENDING: "/assets/pending.svg",
    };

    return (
        <span className={`icon-wrapper ${status.toLowerCase()}`}>
            <img src={iconMap[status]} alt={status} className="step-icon" />
        </span>
    );
};

const Stepper = ({ steps }: Props) => {
    const lastStepStatus = steps[steps.length - 1]?.status;

    return (
        <div className={`approval-stepper last-${lastStepStatus.toLowerCase()}`}>
            <Steps direction="vertical">
                {steps.map((step, index) => {
                    const statusClass = getStatusClass(step.status);
                    const nextStep = steps[index + 1];
                    const nextStatusClass = nextStep ? getStatusClass(nextStep.status) : "";

                    return (
                        <Step
                            key={index}
                            status={getAntStatus(step.status)}
                            icon={getStepIcon(step.status)}
                            className={`${statusClass} ${nextStatusClass ? `next-${nextStatusClass}` : ""}`}
                            title={
                                <div className={`step-header ${statusClass}`}>
                                    <span className="step-role">{step.role}</span>
                                    <Tag className={`status-pill ${statusClass}`}>
                                        {formatStatusLabel(step.status)}
                                    </Tag>
                                </div>
                            }
                            description={
                                <div className={`step-description ${statusClass}`}>
                                    <div className="status-text">{step.display}</div>
                                    {step.timestamp && (
                                        <div className="timestamp">
                                            {dayjs(step.timestamp).format(
                                                "DD MMM YYYY • hh:mm A"
                                            )}
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    );
                })}
            </Steps>
        </div>
    );
};

export default Stepper;