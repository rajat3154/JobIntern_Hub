import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import useGetAppliedJobs from "./hooks/useGetAppliedJobs";

const AppliedJobTable = () => {
  const { appliedJobs, loading } = useGetAppliedJobs();

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <Table className="min-w-full bg-gray-900">
        <TableCaption className="text-gray-400 py-2">
          A list of your applied jobs
        </TableCaption>
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="text-white py-3 px-4 text-sm font-medium">Date</TableHead>
            <TableHead className="text-white py-3 px-4 text-sm font-medium">Job Role</TableHead>
            <TableHead className="text-white py-3 px-4 text-sm font-medium">Company</TableHead>
            <TableHead className="text-white py-3 px-4 text-sm font-medium text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                  <span className="text-white">Loading applications...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : appliedJobs.length <= 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-white">
                You haven't applied to any jobs yet.
              </TableCell>
            </TableRow>
          ) : (
            appliedJobs.map((appliedJob) => (
              <TableRow
                key={appliedJob._id}
                className="hover:bg-gray-800/50 transition-colors"
              >
                <TableCell className="py-3 px-4 text-white text-sm">
                  {appliedJob?.createdAt?.split("T")[0]}
                </TableCell>
                <TableCell className="py-3 px-4 text-white text-sm">
                  {appliedJob.job?.title}
                </TableCell>
                <TableCell className="py-3 px-4 text-white text-sm">
                  {appliedJob.job?.created_by?.companyname}
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  <Badge
                    className={`text-white text-xs py-1 px-2 rounded-md ${appliedJob?.status === "rejected"
                        ? "bg-red-500 hover:bg-red-600"
                        : appliedJob.status === "pending"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : appliedJob.status === "accepted"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    {appliedJob.status.charAt(0).toUpperCase() + appliedJob.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;