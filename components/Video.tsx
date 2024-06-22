import React, { ForwardedRef } from "react";
import { Card, CardContent } from "./ui/card";

function Video(
  props: { muted?: boolean },
  ref: ForwardedRef<HTMLVideoElement>
) {
  return (
    <Card className="flex justify-center items-center shadow-md rounded-lg h-[300px] sm:w-[500px] sm:h-[500px]">
      <CardContent className="flex justify-center items-center p-4">
        <video
          className="w-full object-cover aspect-square max-h-[290px] sm:max-h-[480px] sm:max-w-[500px]"
          autoPlay
          ref={ref}
          muted={props.muted}
        />
      </CardContent>
    </Card>
  );
}

const ForwardedVideo = React.forwardRef(Video);

export default ForwardedVideo;
