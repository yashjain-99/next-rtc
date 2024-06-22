"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function Dashboard() {
  const router = useRouter();
  const formSchema = z.object({
    roomName: z.string().min(2, {
      message: "Room name must be at least 2 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomName: "",
    },
    mode: "all",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(
      `/room/${values.roomName || Math.random().toString(36).slice(2)}`
    );
  }

  return (
    <section className="flex flex-grow justify-center items-center p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="roomName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter room name" {...field} />
                </FormControl>
                <FormDescription>
                  If the room does not exist, we will create one for you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid}
          >
            Submit
          </Button>
        </form>
      </Form>
    </section>
  );
}
