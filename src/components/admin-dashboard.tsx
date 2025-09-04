
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserData } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ExternalLink, HelpCircle, Bell, ShieldAlert, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface UserRecord {
    uid: string;
    data: UserData;
}

export function AdminDashboard() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const listener = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                const userList: UserRecord[] = Object.entries(usersData).map(([uid, data]) => ({
                    uid,
                    data: data as UserData,
                }));
                setUsers(userList);
            }
            setIsLoading(false);
        });

        return () => off(usersRef, 'value', listener);
    }, []);

    const totalUsers = users.length;
    const activeToday = users.filter(u => u.data.lastSeen && new Date(u.data.lastSeen) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

    if (isLoading) {
        return <p>Loading admin data...</p>;
    }

    return (
        <div className="space-y-8 py-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeToday}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>An overview of all registered users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Last Seen</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.data.profile?.photoURL || ''} alt={user.data.profile?.displayName || 'User'} />
                                                    <AvatarFallback>{user.data.profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.data.profile?.displayName}</p>
                                                    <p className="text-sm text-muted-foreground">{user.data.profile?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.data.lastSeen ? formatDistanceToNow(new Date(user.data.lastSeen), { addSuffix: true }) : 'Never'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant="secondary">{(user.data.credentials || []).length} Passwords</Badge>
                                                <Badge variant="secondary">{(user.data.documents || []).length} Docs</Badge>
                                                <Badge variant="secondary">{(user.data.paymentCards || []).length} Cards</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">View Details</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert />Password Recovery</CardTitle>
                        <CardDescription>Information regarding master password recovery.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Alert variant="destructive">
                            <AlertTitle>Zero-Knowledge Architecture</AlertTitle>
                            <AlertDescription>
                                Assisting with master password recovery is not possible. Due to the client-side encryption model, master passwords are never sent to or stored on the server. Only the user has access to their unencrypted master password. This is a core security feature of the application.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell /> Global Notifications</CardTitle>
                        <CardDescription>Send a notification to all users (feature coming soon).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input placeholder="Notification Title" disabled />
                        <Input placeholder="Notification Message" disabled />
                    </CardContent>
                    <CardFooter>
                        <Button disabled>Send Notification</Button>
                    </CardFooter>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><HelpCircle /> Help & Support</CardTitle>
                        <CardDescription>View incoming help requests (feature coming soon).</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground py-10">
                        <p>No active support tickets.</p>
                    </CardContent>
                </Card>

                <Card>
                     <CardHeader>
                        <CardTitle>Auth Page Configuration</CardTitle>
                        <CardDescription>Control the image displayed on the sign-in page (feature coming soon).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input id="image-url" placeholder="https://picsum.photos/1200/1800" disabled />
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button disabled>Update Image</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
