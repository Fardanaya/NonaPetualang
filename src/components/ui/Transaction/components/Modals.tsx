"use client";

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@heroui/react";
import { Button } from "@/components/ui/heroui";
import TextEditor from "@/components/ui/TextEditor";

interface RejectModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    rejectReason: string;
    setRejectReason: (value: string) => void;
    onReject: () => void;
}

interface CancelModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    cancelReason: string;
    setCancelReason: (value: string) => void;
    onCancel: () => void;
}

export const RejectModal = ({
    isOpen,
    onOpenChange,
    rejectReason,
    setRejectReason,
    onReject,
}: RejectModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Reject Order
                        </ModalHeader>
                        <ModalBody>
                            <TextEditor
                                value={rejectReason}
                                onValueChange={(value) => setRejectReason(value)}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                onPress={() => {
                                    onReject();
                                    onClose();
                                }}
                            >
                                Reject
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export const CancelModal = ({
    isOpen,
    onOpenChange,
    cancelReason,
    setCancelReason,
    onCancel,
}: CancelModalProps) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Cancel Order
                        </ModalHeader>
                        <ModalBody>
                            <TextEditor
                                value={cancelReason}
                                onValueChange={(value) => setCancelReason(value)}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose}>
                                Back
                            </Button>
                            <Button
                                color="danger"
                                onPress={() => {
                                    onCancel();
                                    onClose();
                                }}
                            >
                                Cancel Order
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
