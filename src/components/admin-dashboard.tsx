
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off, set, get, child, push, update } from "firebase/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserData, AppConfig, Notification } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, HelpCircle, Bell, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";

interface UserRecord {
    uid: string;
    data: UserData;
}

export function AdminDashboard() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<AppConfig>({});
    const { toast } = useToast();

    // Form states
    const [imageUrls, setImageUrls] = useState('');
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isUpdatingImage, setIsUpdatingImage] = useState(false);
    const [isSendingNotification, setIsSendingNotification] = useState(false);


    useEffect(() => {
        const usersRef = ref(db, 'users');
        const configRef = ref(db, 'config');

        const usersListener = onValue(usersRef, (snapshot) => {
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

        const configListener = onValue(configRef, (snapshot) => {
            const configData = snapshot.val();
            if(configData) {
                setConfig(configData);
                setImageUrls((configData.signInImageUrls || []).join('\n'));
            }
        });

        return () => {
            off(usersRef, 'value', usersListener);
            off(configRef, 'value', configListener);
        }
    }, []);

    const handleUpdateImage = async () => {
        setIsUpdatingImage(true);
        try {
            const urls = imageUrls.split('\n').filter(url => url.trim() !== '');
            await set(ref(db, 'config/signInImageUrls'), urls);
            toast({ title: 'Success', description: 'Sign-in page images updated.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update images.' });
        } finally {
            setIsUpdatingImage(false);
        }
    }

    const handleSendNotification = async () => {
        if (!notificationTitle || !notificationMessage) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title and message are required.' });
            return;
        }
        setIsSendingNotification(true);
        try {
            const usersSnapshot = await get(ref(db, 'users'));
            if (usersSnapshot.exists()) {
                const usersData = usersSnapshot.val();
                
                const notification: Omit<Notification, 'id'> = {
                    title: notificationTitle,
                    message: notificationMessage,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                };

                const fanOut: {[key: string]: any} = {};
                Object.keys(usersData).forEach(uid => {
                    const notificationId = push(child(ref(db), `users/${uid}/notifications`)).key;
                    if(notificationId) {
                         fanOut[`/users/${uid}/notifications/${notificationId}`] = {...notification, id: notificationId};
                    }
                });

                await update(ref(db), fanOut);
                
                toast({ title: 'Success', description: 'Global notification sent to all users.' });
                setNotificationTitle('');
                setNotificationMessage('');
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send notification.' });
        } finally {
            setIsSendingNotification(false);
        }
    }


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
                        <CardDescription>Send a notification to all users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input placeholder="Notification Title" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} disabled={isSendingNotification} />
                        <Textarea placeholder="Notification Message" value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} disabled={isSendingNotification} />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSendNotification} disabled={isSendingNotification}>
                            {isSendingNotification ? 'Sending...' : 'Send Notification'}
                        </Button>
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
                        <CardDescription>Manage the slideshow images on the sign-in page. Enter one URL per line.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="image-urls">Image URLs</Label>
                            <Textarea 
                                id="image-urls" 
                                placeholder="https://picsum.photos/1200/1800&#10;https://picsum.photos/1200/1801&#10;https://picsum.photos/1200/1802" 
                                value={imageUrls} 
                                onChange={(e) => setImageUrls(e.target.value)} 
                                disabled={isUpdatingImage}
                                rows={5} 
                            />
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button onClick={handleUpdateImage} disabled={isUpdatingImage}>
                            {isUpdatingImage ? 'Updating...' : 'Update Images'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
