import React, { FC } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FormModalType {
  show: boolean
  type: "error" | "success"
  title: string
  message: string
}

interface AlertModalProps {
  formModal: FormModalType
  setFormModal: (modal: FormModalType) => void
}

const AlertModal: FC<AlertModalProps> = ({ formModal, setFormModal }) => {
  const handleClose = () => {
    setFormModal({ ...formModal, show: false })
  }

  return (
    <Dialog open={formModal.show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="flex justify-center">
            {formModal.type === "error" ? (
              <AlertCircle className="h-20 w-20 text-red-600" />
            ) : (
              <CheckCircle className="h-20 w-20 text-green-600" />
            )}
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
            {formModal.title}
          </h2>

          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            {formModal.message}
          </p>

          <div className="flex justify-end pt-4 w-full">
            <Button
              onClick={handleClose}
              variant="outline"
              className="rounded-full px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AlertModal
