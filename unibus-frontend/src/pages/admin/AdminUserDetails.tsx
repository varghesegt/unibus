import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Mail, Phone, UserCheck, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNo: string;
  college: string;
  degree: string;
  department: string;
  semester: string;
  year: string;
  gender: string;
  dateOfBirth: string;
  isVerified: boolean;
  isAdmin: boolean;
}

export default function AdminUserDetails() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage registered passengers
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-slate-200 bg-white/80 pl-10 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/80"
          />
        </div>
      </div>

      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-3 rounded-full bg-gradient-to-b from-orange-500 to-red-600"></div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Registered Users
            </h2>
            <div className="ml-auto">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                {users.length} Users
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">Roll No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p className="text-slate-500">No users found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-700 dark:from-slate-600 dark:to-slate-700 dark:text-slate-200">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                              <div className="text-xs text-slate-500">{user.college}</div>
                              <div className="text-xs text-slate-400">{(user.degree ? user.degree + ' ' : '') + (user.department || '')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" /> {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" /> {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                          {user.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <UserCheck className="h-3 w-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              <XCircle className="h-3 w-3" /> Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.isAdmin ? (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Admin</span>
                          ) : (
                            <span className="text-slate-500">Passenger</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
