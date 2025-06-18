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

const AppliedInternshipsTable = () => {
  return (
    <div>
      <Table className="min-w-full bg-black text-white rounded-lg shadow-lg overflow-hidden">
        <TableCaption className="text-blue-500">
          A list of your applied internships
        </TableCaption>
        <TableHeader className="bg-blue-600">
          <TableRow>
            <TableHead className="text-white py-3 px-4">Date</TableHead>
            <TableHead className="text-white py-3 px-4">
              Internship Role
            </TableHead>
            <TableHead className="text-white py-3 px-4">Company</TableHead>
            <TableHead className="text-white py-3 px-4 text-right">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-blue-700 transition-all duration-200">
            <TableCell className="py-3 px-4">2024-03-08</TableCell>
            <TableCell className="py-3 px-4">Software Intern</TableCell>
            <TableCell className="py-3 px-4">Samsung</TableCell>
            <TableCell className="py-3 px-4 text-right">
              <Badge className="bg-green-400 text-white py-1 px-3 rounded-full">
                ACCEPTED
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-blue-700 transition-all duration-200">
            <TableCell className="py-3 px-4">2024-02-25</TableCell>
            <TableCell className="py-3 px-4">Data Science Intern</TableCell>
            <TableCell className="py-3 px-4">Google</TableCell>
            <TableCell className="py-3 px-4 text-right">
              <Badge className="bg-gray-400 text-white py-1 px-3 rounded-full">
                PENDING
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-blue-700 transition-all duration-200">
            <TableCell className="py-3 px-4">2024-02-18</TableCell>
            <TableCell className="py-3 px-4">Web Development Intern</TableCell>
            <TableCell className="py-3 px-4">Meta</TableCell>
            <TableCell className="py-3 px-4 text-right">
              <Badge className="bg-red-400 text-white py-1 px-3 rounded-full">
                REJECTED
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedInternshipsTable;
