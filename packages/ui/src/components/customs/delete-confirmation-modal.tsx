import { Dialog, DialogClose, DialogContent, DialogTitle } from "../dialog";
import { Button } from "../button";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onToggle: () => void;
  isDeletingInfo?: boolean;
  title: string;
  message: string;
  deletingText: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (...params: any) => void;
}

export const DeleteConfirmation = ({
  isOpen,
  onToggle,
  title,
  isDeletingInfo = false,
  deletingText,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: DeleteConfirmationProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogContent className="">
        <DialogTitle className="text-xl">{title}</DialogTitle>
        <p className="text-sm text-black">{message}</p>
        <div className="flex w-full flex-row items-center justify-end gap-3 md:gap-5">
          <DialogClose>
            <Button
              className="btn-padding px-5 lg:px-[2rem]"
              disabled={isDeletingInfo}
            >
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            disabled={isDeletingInfo}
            type="submit"
            variant="outline"
            className="btn-padding px-5 lg:px-[2rem]"
            onClick={onConfirm}
          >
            {isDeletingInfo ? deletingText : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
