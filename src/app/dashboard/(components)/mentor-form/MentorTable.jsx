"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import Search from "../Search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MentorForm } from "./MentorForm";
import { DeleteButton } from "../button/DeleteButton";

export function MentorTabe({ data, years }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedYear = searchParams.get("year");
  const [isOpen, setIsOpen] = useState(null);
  const [mentors, setMentors] = useState(data);
  const handleSelect = (year) => {
    // Update URL with year query
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`/dashboard/mentors?${params.toString()}`);
  };

  useEffect(() => {
    setMentors(data);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Mentor</CardTitle>
            <CardDescription>List of mentor</CardDescription>
          </div>
          <Button>
            <Link href={"/dashboard/mentors/add"}>Add mentor</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Search link={"/dashboard/mentors"} />
      </CardContent>
      <CardContent>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <CardDescription className="flex items-center gap-1">
                          Year {selectedYear ?? "All"} <ChevronsUpDown />
                        </CardDescription>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSelect("all")}>
                        All
                      </DropdownMenuItem>
                      {years.map((y) => (
                        <DropdownMenuItem
                          key={y}
                          onClick={() => handleSelect(y)}
                        >
                          {y}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors.map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        alt="@shadcn"
                        className="object-cover"
                        src={
                          item?.image
                            ? item.image
                            : "https://github.com/shadcn.png"
                        }
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>{" "}
                    {item.name}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <button
                            className="w-full text-start"
                            onClick={() => setIsOpen(index)}
                          >
                            Edit
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <DeleteButton
                            itemName={item.name}
                            onDelete={async () => {
                              const res = await fetch(
                                `/api/mentor/delete/${item._id}`,
                                { method: "DELETE" },
                              );
                              const data = await res.json();
                              if (!data.success) throw new Error(data.message);
                              alert(data.message)
                              setMentors((prev) =>
                                prev.filter((m) => m._id !== item._id),
                              );
                            }}
                          />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  {isOpen === index && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      {/* Backdrop */}
                      <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(null)}
                      ></div>

                      {/* Modal content */}
                      <div className="relative z-10 w-full max-w-lg p-6">
                        <MentorForm data={item} />
                      </div>
                    </div>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </CardContent>
    </Card>
  );
}
