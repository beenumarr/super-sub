import { CheckCircle, XCircle, X } from 'lucide-react';

interface AlertState {
    show: boolean;
    type: string;
    title: string;
    message: string;
}

interface AlertModalProps {
    formModal: AlertState;
    setFormModal: (state: AlertState) => void;
}

export default function AlertModal({ formModal, setFormModal }: AlertModalProps) {
    if (!formModal.show) return null;

    const isSuccess = formModal.type !== 'error';

    const handleClose = () =>
        setFormModal({
            ...formModal,
            show: false,
        });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/70"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                        aria-label="Close alert"
                    >
                        <X size={18} />
                    </button>

                    {/* Content */}
                    <div className="p-6 text-center">
                        {/* Icon */}
                        <div className="mb-4 flex items-center justify-center">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                    isSuccess
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300'
                                        : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                                }`}
                            >
                                {isSuccess ? (
                                    <CheckCircle size={28} />
                                ) : (
                                    <XCircle size={28} />
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {formModal.title}
                        </h2>

                        {/* Message */}
                        <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            {formModal.message}
                        </p>

                        {/* Button */}
                        <button
                            onClick={handleClose}
                            className={`w-full rounded-md py-2.5 text-sm font-medium text-white ${
                                isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isSuccess ? 'Okay' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

