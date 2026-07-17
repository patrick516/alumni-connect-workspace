import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

interface NotificationProps {
  title: string;
  description?: string;
}

export const Notification = ({ title, description }: NotificationProps) => {
  return (
    <Toast>
      <ToastTitle>{title}</ToastTitle>
      {description && <ToastDescription>{description}</ToastDescription>}
    </Toast>
  );
};
