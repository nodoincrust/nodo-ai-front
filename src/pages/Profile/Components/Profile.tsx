import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form } from "antd";
import "./Styles/Profile.scss";
import { getRoleFromToken } from "../../../utils/jwt";

export interface ProfileProps {
    open: boolean;
    onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ open, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [form] = Form.useForm();
    const [animateClose, setAnimateClose] = useState(false);
    const [user, setUser] = useState<{ name?: string; email?: string; role?: string }>({});

    /** Capitalize first letter of each word */
    const capitalizeName = (name: string) =>
        name
            ? name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : "";

    /** Lock / unlock scroll */
    const lockScroll = () => {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollBarWidth}px`;
    };

    const unlockScroll = () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
    };

    /** Load user from localStorage + decode role */
    const loadUser = () => {
        try {
            const stored = localStorage.getItem("authData");
            if (stored) {
                const parsed = JSON.parse(stored);
                const role = parsed.token ? getRoleFromToken(parsed.token) : "";
                setUser({
                    name: parsed.user?.name || "",
                    email: parsed.user?.email || "",
                    role: role || "",
                });
            }
        } catch (err) {
            console.error("Error reading user from localStorage", err);
            setUser({});
        }
    };

    /** Open modal and load data when `open` changes */
    useEffect(() => {
        if (open) {
            loadUser();
            setAnimateClose(false);
            lockScroll();
        } else {
            setAnimateClose(true);
            unlockScroll();
        }
    }, [open]);

    /** Populate form whenever user state changes */
    useEffect(() => {
        form.setFieldsValue({
            name: capitalizeName(user.name || ""),
            email: user.email || "",
            roleName: user.role || "",
        });
    }, [user, form]);

    /** Close modal */
    const handleClose = () => {
        setAnimateClose(true);
        onClose();
        unlockScroll();
    };

    /** Click outside to close */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    if (!open) return null;

    return (
        <Modal
            open={open}
            footer={null}
            closable={false}
            centered
            width={412}
            className={`profile-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
            getContainer={false}
            transitionName=""
            zIndex={2000}
        >
            <div className="profile-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="profile-header">
                    <div className="left">
                        <img
                            src="/assets/user-rounded-02.svg"
                            alt="profile"
                            className="header-icon"
                        />
                        <h2>Profile Details</h2>
                    </div>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* FORM */}
                <Form layout="vertical" form={form} className="profile-form" autoComplete="off">
                    <Form.Item label="User Name" name="name">
                        <Input readOnly />
                    </Form.Item>

                    <Form.Item label="Email Address" name="email">
                        <Input readOnly />
                    </Form.Item>

                    <Form.Item label="Role Name" name="roleName">
                        <Input readOnly />
                    </Form.Item>
                </Form>

                {/* FOOTER */}
                <div className="profile-footer">
                    <Button type="primary" className="cancel-btn" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default Profile;