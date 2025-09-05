
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";

type MediaState = {
  isOpen: boolean;
  file?: {
    name: string;
    type: string;
    dataUri: string;
  }
}

export const mediaPreviewAtom = atom<MediaState>({ isOpen: false });


export function MediaPreviewDialog() {
  const [mediaState, setMediaState] = useAtom(mediaPreviewAtom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setMediaState({ isOpen: false });
    }
  };
  
  if (!isClient) return null;

  const fileType = mediaState.file?.type.split('/')[0];

  return (
    <Dialog open={mediaState.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={fileType === 'video' ? "max-w-2xl" : "max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{mediaState.file?.name}</DialogTitle>
          <DialogDescription>
            Secure preview of {mediaState.file?.type}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center bg-muted/50 rounded-lg">
           {fileType === 'video' && mediaState.file?.dataUri && (
                <video controls autoPlay className="max-w-full max-h-[70vh] rounded-md">
                    <source src={mediaState.file.dataUri} type={mediaState.file.type} />
                    Your browser does not support the video tag.
                </video>
           )}
           {fileType === 'audio' && mediaState.file?.dataUri && (
                <audio controls autoPlay className="w-full">
                    <source src={mediaState.file.dataUri} type={mediaState.file.type} />
                    Your browser does not support the audio element.
                </audio>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
