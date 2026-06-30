import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { inquiriesApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const inquiryStatuses = ["new", "contacted", "booked", "closed"];

export function AdminInquiriesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const inquiriesQuery = useQuery({
    queryKey: ["inquiries", statusFilter],
    queryFn: () =>
      inquiriesApi.list(statusFilter === "all" ? {} : { status: statusFilter }),
    select: (data) => data.inquiries,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => inquiriesApi.update(id, payload),
    onSuccess: () => {
      toast.success("Inquiry updated");
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to update inquiry.")),
  });

  const convertMutation = useMutation({
    mutationFn: (id) => inquiriesApi.convert(id),
    onSuccess: () => {
      toast.success("Inquiry converted to customer");
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Unable to convert inquiry.")),
  });

  const inquiries = inquiriesQuery.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-surface-600">
              Inquiries
            </p>
            <h1 className="mt-2 font-display text-5xl text-ink-900">New leads and questions</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
              Review contact form messages, add private notes, and convert promising inquiries into customer profiles.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All inquiries</SelectItem>
                {inquiryStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!inquiries.length ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries yet"
          description="Contact form messages will appear here as new leads."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {inquiries.map((inquiry) => (
            <InquiryCard
              key={inquiry._id}
              inquiry={inquiry}
              onUpdate={(payload) =>
                updateMutation.mutate({ id: inquiry._id, payload })
              }
              onConvert={() => convertMutation.mutate(inquiry._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InquiryCard({ inquiry, onUpdate, onConvert }) {
  const [privateNote, setPrivateNote] = useState(inquiry.privateNote || "");

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-surface-600">
              {inquiry.status}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-900">{inquiry.name}</h2>
            <p className="text-sm text-ink-700/70">{inquiry.email || "No email"}</p>
            <p className="text-sm text-ink-700/70">{inquiry.phone || "No phone"}</p>
          </div>
          <Select
            value={inquiry.status}
            onValueChange={(status) => onUpdate({ ...inquiry, status })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inquiryStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="rounded-[1.4rem] bg-surface-50 p-4 text-sm leading-7 text-ink-700/75">
          {inquiry.message}
        </p>
        <div className="space-y-2">
          <Label>Private note</Label>
          <Textarea value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => onUpdate({ ...inquiry, privateNote })}>
            Save note
          </Button>
          <Button onClick={onConvert}>Convert to customer</Button>
        </div>
      </CardContent>
    </Card>
  );
}
