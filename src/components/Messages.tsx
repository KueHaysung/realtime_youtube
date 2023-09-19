"use client";
import { pusherClient } from "@/lib/pusher";
import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Menu,
  Item,
  useContextMenu,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
const MENU_ID = "menu-id";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}
const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  sessionImg,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messageDeler = (message: Message) => {
    setMessages((prev) => prev.filter((m) => m.id != message.id));

    console.log("messages[0].id：", messages[3], "m.id", message);
  };

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    // pusherClient.bind("delete-message", messageDeler);
    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      // pusherClient.unbind("delete-message", messageDeler);
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  //右键
  const { show } = useContextMenu({
    id: MENU_ID,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  async function handleItemClick({ message }: { message: Message }) {
    if (!message) return;
    setIsLoading(true);
    try {
      await axios.post("/api/message/del", {
        text: message.text,
        chatId,
        time: message.timestamp,
      });
      messageDeler(message);
      textareaRef.current?.focus();
    } catch {
      toast.error("Something went wrong. Please try again later!!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <Menu id={MENU_ID}>
        <Item onClick={({ props }) => handleItemClick({ message: props })}>
          删除此消息
        </Item>
      </Menu>
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  onContextMenu={(e) => {
                    show({
                      event: e,
                      props: message,
                    });
                  }}
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                  }
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default Messages;
