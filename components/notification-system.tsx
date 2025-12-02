"use client"

import { CheckCircle, AlertCircle, X } from "lucide-react"

export interface Notification {
  id: string
  type: "success" | "error" | "info"
  message: string
  duration?: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-green-500/90 border-green-400 text-white"
              : notification.type === "error"
                ? "bg-red-500/90 border-red-400 text-white"
                : "bg-blue-500/90 border-blue-400 text-white"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {notification.type === "success" && <CheckCircle className="w-5 h-5" />}
            {notification.type === "error" && <AlertCircle className="w-5 h-5" />}
          </div>
          <p className="flex-1 text-sm font-medium">{notification.message}</p>
          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
