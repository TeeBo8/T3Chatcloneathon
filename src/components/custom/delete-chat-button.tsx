"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button"
import { Trash } from "lucide-react"
import { deleteChat } from "@/app/actions"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"

interface DeleteChatButtonProps {
  chatId: string
}

export function DeleteChatButton({ chatId }: DeleteChatButtonProps) {
  const router = useRouter()
  const params = useParams()
  const currentChatId = params?.chatId

  const handleDelete = async () => {
    try {
      const result = await deleteChat(chatId)
      if (result?.error) {
        toast.error("Failed to delete conversation")
      } else {
        toast.success("Conversation deleted successfully")
        // If we're currently viewing the deleted chat, redirect to new chat
        if (currentChatId === chatId) {
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast.error("Failed to delete conversation")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this chat conversation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 