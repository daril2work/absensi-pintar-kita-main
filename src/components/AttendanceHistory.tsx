import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, Clock, ClockIcon } from 'lucide-react';

interface AttendanceHistoryProps {
  userId?: string;
}

export const AttendanceHistory = ({ userId }: AttendanceHistoryProps) => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAttendanceHistory();
    }
  }, [userId]);

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('absensi')
      .select(`
        *,
        shift:shift_id (
          id,
          nama_shift,
          jam_masuk,
          jam_keluar
        )
      `)
      .eq('user_id', userId)
      .order('waktu', { ascending: false })
      .limit(10);

    if (!error && data) {
      setAttendance(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'HADIR': 'default',
      'TERLAMBAT': 'secondary',
      'MAKE_UP': 'outline'
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    return (
      <Badge variant={method === 'absen' ? 'default' : 'outline'}>
        {method === 'absen' ? 'Regular' : 'Make-up'}
      </Badge>
    );
  };

  const renderClockOutCell = (record: any) => {
    if (record.clock_out_time) {
      return (
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3 text-orange-600" />
          {format(new Date(record.clock_out_time), 'HH:mm')}
        </div>
      );
    }

    if (record.shift && record.shift.jam_keluar) {
      const now = new Date();
      const attendanceDate = new Date(record.waktu);
      const shiftEndTimeString = record.shift.jam_keluar;
      
      const [hours, minutes, seconds] = shiftEndTimeString.split(':');
      const shiftEndDateTime = new Date(attendanceDate);
      shiftEndDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || '0', 10), 0);

      const shiftStartTimeString = record.shift.jam_masuk;
      if (shiftEndTimeString < shiftStartTimeString) {
          shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
      }

      if (now > shiftEndDateTime) {
        return (
          <Badge variant="destructive" className="text-xs">
            Missed Clock Out
          </Badge>
        );
      }
    }

    return (
      <Badge variant="secondary" className="text-xs">
        Belum Clock Out
      </Badge>
    );
  };

  const formatWorkingHours = (record: any) => {
    if (record.clock_out_time) {
      const start = new Date(record.waktu);
      const end = new Date(record.clock_out_time);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${diffHours}h ${diffMinutes}m`;
    }

    if (record.shift && record.shift.jam_keluar) {
      const now = new Date();
      const attendanceDate = new Date(record.waktu);
      const shiftEndTimeString = record.shift.jam_keluar;
      
      const [hours, minutes, seconds] = shiftEndTimeString.split(':');
      const shiftEndDateTime = new Date(attendanceDate);
      shiftEndDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || '0', 10), 0);

      const shiftStartTimeString = record.shift.jam_masuk;
      if (shiftEndTimeString < shiftStartTimeString) {
          shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
      }

      if (now > shiftEndDateTime) {
        return <span className="text-red-500">N/A</span>;
      }
    }

    return 'Belum Clock Out';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Shift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.waktu), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-green-600" />
                        {format(new Date(record.waktu), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderClockOutCell(record)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {formatWorkingHours(record)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(record.metode)}
                    </TableCell>
                    <TableCell>
                      {record.shift ? (
                        <div className="text-sm">
                          <div className="font-medium">{record.shift.nama_shift}</div>
                          <div className="text-xs text-gray-500">
                            {record.shift.jam_masuk} - {record.shift.jam_keluar}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};