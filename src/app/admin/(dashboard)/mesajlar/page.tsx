import { getMessages } from "@/actions/admin";
import { MessagesAdmin } from "@/components/admin/MessagesAdmin";

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Mesajlar</h1>
      <MessagesAdmin initial={messages as never} />
    </div>
  );
}
