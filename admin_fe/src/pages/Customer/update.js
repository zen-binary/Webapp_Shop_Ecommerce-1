import { DatePicker, InputNumber, Select, Button, Checkbox, Modal } from 'antd/lib';
import { Input } from "../../components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { makeid } from '~/lib/functional';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Label } from "~/components/ui/label"
// import { Button } from '~/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '../../lib/functional'
import {
    CaretSortIcon,
    ChevronDownIcon,
    DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { IoArrowBackSharp } from "react-icons/io5";

dayjs.extend(customParseFormat);

const formSchema = z.object({
    codeCustomer: z.string().min(2, {
        message: "code must be at least 2 characters.",
    }),
    fullName: z.string().min(2, {
        message: "Hãy nhập tên",
    }),
    gender: z.number({
        required_error: "Hãy chọn giới tính",
    }),
    address: z.string(),
    phone: z.string().startsWith("0"),
    email: z.string().email({}),
    username: z.string().min(4, {
        message: "",
    }),
    password: z.string()
});

const modalFormSchema = z.object({
    receiverName: z.string(),
    receiverPhone: z.string(),
})


const token = 'a98f6e38-f90a-11ee-8529-6a2e06bbae55'
export default function AddCustomer() {

    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})

    const [birthDay, setBirthday] = useState(dayjs(new Date()));
    const [listProvince, setListProvince] = useState([]);
    const [listDistricts, setListDistricts] = useState([]);
    const [listWards, setListWards] = useState([]);

    const [targetCustomer, setTargetCustomer] = useState();
    const [listAddress, setListAddress] = useState([])

    const path = useParams();
    const [defaultAddress, setDefaultAddress] = useState(0);

    useEffect(() => {
        axios.get(`${baseUrl}/customer/${path.id}`).then(res => {
            setTargetCustomer(res.data)
            if (res.data.birthday) {
                setBirthday(dayjs(res.data.birthday))
            }
            setListAddress(res.data.lstAddress.map((add, index) => {
                if (add.defaultAddress) {
                    setDefaultAddress(add.id)
                }
                return {
                    ...add,
                    province: {
                        id: add.provinceID.toString(),
                        name: add.province
                    },
                    district: {
                        id: add.districtID.toString(),
                        name: add.district
                    },
                    commune: {
                        id: add.communeID.toString(),
                        name: add.commune
                    },
                    receivername: add.receiverName,
                    phone: add.receiverPhone
                }
            }))
            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/province`, {
                headers: {
                    token: token
                }
            }).then(resp => {
                setListProvince(resp.data.data);

            })

        })
    }, [path.id])

    const setAddProvinceP = (value, key, id) => {
        if (!key && !id) return;
        axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${value}`, {
            headers: {
                token: token
            }
        }).then(res => {
            let listFilteredDistrict = res.data.data.filter(dis => dis.DistrictID != 3451)
            setListDistricts(listFilteredDistrict);
            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${listFilteredDistrict[0].DistrictID}`, {
                headers: {
                    token: token
                }
            }).then(resp => {
                setListWards(resp.data.data);
                setListAddress(prev => {
                    return prev.map(target => {
                        if ((key && target.key == key) || (id && target.id == id)) {
                            let prov = listProvince.find(province => province.ProvinceID == value);
                            setEditAddress({
                                ...editAddress, province: { id: prov.ProvinceID, name: prov.ProvinceName },
                                district: { id: listFilteredDistrict[0].DistrictID, name: listFilteredDistrict[0].DistrictName },
                                commune: { id: resp.data.data[0].WardCode, name: resp.data.data[0].WardName }
                            })
                            return {
                                ...target,
                                province: { id: prov.ProvinceID, name: prov.ProvinceName },
                                district: { id: listFilteredDistrict[0].DistrictID, name: listFilteredDistrict[0].DistrictName },
                                commune: { id: resp.data.data[0].WardCode, name: resp.data.data[0].WardName }
                            }
                        } else {
                            return target
                        }
                    })
                })
            })

        })
    }

    const setAddDistrictP = (value, key, id) => {
        if (!key && !id) return;
        axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${value}`, {
            headers: {
                token: token
            }
        }).then(res => {
            setListWards(res.data.data);
            setListAddress(prev => {
                return prev.map(target => {
                    if ((key && target.key == key) || (id && target.id == id)) {
                        let dist = listDistricts.find(district => district.DistrictID == value)
                        setEditAddress({
                            ...editAddress,
                            district: { id: dist.DistrictID, name: dist.DistrictName },
                            commune: { id: res.data.data[0].WardCode, name: res.data.data[0].WardName }
                        })
                        return {
                            ...target,
                            district: { id: dist.DistrictID, name: dist.DistrictName },
                            commune: { id: res.data.data[0].WardCode, name: res.data.data[0].WardName }
                        }
                    }
                    else {
                        return target
                    }
                });
            })
        })
    }

    const setAddCommuneP = (value, key, id) => {
        if (!key && !id) return;
        try {
            setListAddress(prev => {
                let ward = listWards.find(target => target.WardCode == value);
                return prev.map(target => {
                    if ((key && target.key == key) || (id && target.id == id)) {
                        return { ...target, commune: { id: ward.WardCode, name: ward.WardName } }
                    } else {
                        return target
                    }
                });
            })
        } catch (error) {

        }
    }

    const navigate = useNavigate();

    const handleChangeReceiverName = (key, newValue, id) => {
        if (!key && !id) return;
        setEditAddress({ ...editAddress, receiverName: newValue })
        setListAddress(prev => {
            return prev.map(address => {
                if ((key && address.key == key) || (id && address.id == id)) {
                    return { ...address, receivername: newValue };
                }
                return address;
            });
        });
    };

    const handleChangeReceiverPhone = (key, newValue, id) => {
        if (!key && !id) return;
        try {
            setEditAddress({ ...editAddress, phone: newValue })
            setListAddress(prev => {
                return prev.map(address => {
                    if ((key && address.key == key) || (id && address.id == id)) {
                        return { ...address, phone: newValue };
                    }
                    return address;
                });
            });
        } catch (error) {
            console.log(error)
        }
    }

    const handleChangeReceiverDetail = (key, newValue, id) => {
        if (!key && !id) return;
        try {
            setListAddress(prev => {
                return prev.map(address => {
                    if ((key && address.key == key) || (id && address.id == id)) {
                        return { ...address, detail: newValue };
                    }
                    return address;
                });
            });
        } catch (error) {
            console.log(error)
        }
    }

    const Remove = (key, id) => {
        if (key) {
            let q = listAddress.filter(target => key != target.key)
            setListAddress(q);
        } else if (id) {
            axios.delete(`${baseUrl}/address/${id}`)
            let x = listAddress.filter(target => id != target.id)
            setListAddress(x);
        }
    }

    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = useMemo(() => [
        {
            accessorKey: "key",
            header: "Mặc định",
            cell: ({ row }) => (<>
                {/* {row.original && <div className="capitalize">{row.original.key}</div>} */}
                <Checkbox checked={defaultAddress == row.original.id || defaultAddress == row.original.key} />
            </>
            ),
        },
        {
            accessorKey: "receivername",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        className='flex items-center border-none'
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        tên người nhận
                        <CaretSortIcon className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">
                {row.original && <p>{row.original.receivername}</p>}
            </div>,
        },
        {
            accessorKey: "phone",
            header: () => <div className="text-center">số điện thoại</div>,
            cell: ({ row }) => {
                return <div className="text-center font-medium max-h-16">
                    {row.original && <p>{row.original.phone}</p>}
                </div>
            },
        },
        {
            accessorKey: "province",
            header: () => <div className="text-center">Tỉnh/ Thành phố</div>,
            cell: ({ row }) => {
                return <div className='text-center'>
                    {
                        row.original &&
                        <p>{row.original.province.name}</p>
                    }
                </div>
            },
        },
        {
            accessorKey: "district",
            header: () => <div className="text-center">Quận/ huyện</div>,
            cell: ({ row }) => {
                return <div className='text-center'>
                    {
                        row.original && <p>{row.original.district.name}</p>
                    }
                </div>
            },
        },
        {
            accessorKey: "commune",
            header: () => <div className="text-center">Xã/ phường</div>,
            cell: ({ row }) => {
                return <div className='text-center'>
                    {row.original && <p>{row.original.commune.name}</p>}
                </div>
            },
        },
        {
            accessorKey: "detail",
            header: () => <div className="text-center">Chi tiết</div>,
            cell: ({ row }) => {
                return <div className="text-center font-medium max-h-16">
                    {row.original && <p>{row.original.detail}</p>}
                </div>
            },
        },
        {
            id: "hành động",
            enableHiding: false,
            header: () => <div className="text-center">hành động</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type='primary' variant="ghost" className="h-8 w-8 p-0 flex justify-center items-center">
                                    <DotsHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setEditAddress(row.original); setIsModalOpen(true) }}>Cập nhật</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { Remove(row.original.key, row.original.id) }}>Xóa</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ], [listDistricts, listWards, defaultAddress, listProvince, listAddress, Remove]);

    const table = useReactTable({
        data: listAddress,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const form = useForm(
        {
            resolver: zodResolver(formSchema),
            mode: 'all',
            values: {
                codeCustomer: targetCustomer ? targetCustomer.codeCustomer : makeid(),
                fullName: targetCustomer ? targetCustomer.fullName : "",
                birthDay: targetCustomer ? targetCustomer.birthDay : birthDay,
                gender: targetCustomer ? targetCustomer.gender : "",
                address: targetCustomer ? targetCustomer.address : "",
                phone: targetCustomer ? targetCustomer.phone : "",
                email: targetCustomer ? targetCustomer.email : "",
                username: targetCustomer ? targetCustomer.username : "",
                password: targetCustomer ? targetCustomer.password : makeid(),
            }
        }
    )

    const handleSubmitForm = (values) => {
        const data = { ...values, birthDay: birthDay }
        axios.put(`${baseUrl}/customer/${path.id}`, data).then(res => {
            const promises = listAddress.map(add => {
                const body = {
                    receiverName: add.receivername,
                    receiverPhone: add.phone,
                    commune: add.commune.name,
                    district: add.district.name,
                    province: add.province.name,
                    communeID: add.commune.id,
                    districtID: add.district.id,
                    provinceID: add.province.id,
                    defaultAddress: defaultAddress == add.id,
                    detail: add.detail,
                    customer: path.id,
                    id: add.id
                }
                return axios.post(`${baseUrl}/address`, body)
            })
            return Promise.all(promises)
                .then(() => {
                    toast.success('cập nhật khách hàng thành công');
                    setTimeout(() => {
                        navigate(`/user/customer/detail/${res.data.data.id}`)
                    }, 2000);
                });
        })
    }

    const handleAddAddress = () => {
        let newObject = {
            key: listAddress.length + 1,
            receivername: "",
            phone: "",
            province: { id: '269', name: 'Lào Cai' },
            district: { id: '2264', name: 'Huyện Si Ma Cai' },
            commune: { id: '90816', name: 'Thị Trấn Si Ma Cai' }
        }
        setEditAddress(newObject);
        setListAddress(prev => [...prev, newObject])
        // setIsModalOpen(true);
    }

    useEffect(() => {
        console.log(listAddress)
    }, [listAddress])

    const [editAddress, setEditAddress] = useState({});

    const modalForm = useForm(
        {
            resolver: zodResolver(modalFormSchema),
            mode: 'all',
            values: {
                receiverName: editAddress.receiverName || '',
                phone: "",
                province: { id: '269', name: 'Lào Cai' },
                district: { id: '2264', name: 'Huyện Si Ma Cai' },
                commune: { id: '90816', name: 'Thị Trấn Si Ma Cai' }
            }
        }
    )

    return (
        <div className='flex xl:flex-col'>
            <ToastContainer />
            <div className='flex flex-col gap-3 w-full bg-white shadow-lg rounded-md p-5'>
                <div className='flex gap-2 items-center'>
                    <div className='text-lg cursor-pointer' onClick={() => { navigate('/user/customer') }}><IoArrowBackSharp /></div>
                    <p className='ml-3 text-lg font-semibold'>Thông tin khách hàng</p>
                </div>
                <div className='relative after:w-full after:h-[2px] after:absolute after:bottom-0 after:left-0 after:bg-slate-600'></div>
                <Form {...form}>
                    <form onSubmit={e => { e.preventDefault() }} className="space-y-8">
                        <div className='grid grid-cols-2 max-lg:grid-cols-1 p-3 gap-x-6'>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) =>
                                (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input className='w-full h-10' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='grid grid-cols-2 max-lg:grid-cols-1 p-3 gap-x-6 items-center'>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) =>
                                (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input className='w-full' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex gap-5 items-center'>
                                <FormField
                                    control={form.control}
                                    name="birthday"
                                    render={({ field }) =>
                                    (
                                        <FormItem>
                                            <FormLabel></FormLabel>
                                            <FormControl>
                                                <>
                                                    <p>Sinh nhật</p>
                                                    <DatePicker format={"DD-MM-YYYY"} maxDate={dayjs(new Date(), "DD-MM-YYYY")} value={birthDay || new Date()} onChange={birthDay => setBirthday(birthDay)} />
                                                </>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) =>
                                    (
                                        <FormItem>
                                            <FormLabel>Giới tính</FormLabel>
                                            <FormControl defaultValue='1'>
                                                <RadioGroup className="flex gap-3 items-center">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="0" id="option-one" />
                                                        <Label htmlFor="option-one">Nam</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="1" id="option-two" />
                                                        <Label htmlFor="option-two">Nữ</Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <p className='ml-3 text-lg font-semibold'>Danh sách địa chỉ</p>
                        <div className='mb-3 relative after:w-full after:h-[2px] after:absolute after:bottom-0 after:left-0 after:bg-slate-600'></div>
                        <Button type="primary" onClick={() => { handleAddAddress(); }}>
                            Thêm địa chỉ mới
                        </Button>
                        <Modal title="Basic Modal" open={isModalOpen} onOk={() => { setIsModalOpen(false) }} onCancel={() => { setIsModalOpen(false) }}>
                            <Form {...modalForm}>
                                <form onSubmit={() => { }} className="space-y-8">
                                    <FormField
                                        control={modalForm.control}
                                        name="receiverName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Họ và tên</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={editAddress.receiverName} onChange={e => { handleChangeReceiverName(editAddress.key, e.target.value, editAddress.id); }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={modalForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={editAddress.phone} onChange={e => { handleChangeReceiverPhone(editAddress.key, e.target.value, editAddress.id); }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={modalForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tỉnh thành phố</FormLabel>
                                                <FormControl>
                                                    <Select className='min-w-[110px]' placeholder='Tỉnh/ Thành phố' {...field} value={editAddress.province.name} onChange={value => { setAddProvinceP(value, editAddress.key, editAddress.id); }}>
                                                        {
                                                            listProvince.map((province, key) => {
                                                                return <option key={key} value={province.ProvinceID.toString()}>{province.ProvinceName}</option>
                                                            })
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={modalForm.control}
                                        name="district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quận huyện</FormLabel>
                                                <FormControl>
                                                    <Select className='min-w-[110px]' placeholder='Quận/ huyện' {...field} value={editAddress.district.name} onChange={value => { setAddDistrictP(value, editAddress.key, editAddress.id); }}>
                                                        {
                                                            listDistricts.map((district, key) => {
                                                                return <option key={key} value={district.DistrictID.toString()}>{district.DistrictName}</option>
                                                            })
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={modalForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Xã phường</FormLabel>
                                                <FormControl>
                                                    <Select {...field} className='min-w-[110px]' placeholder='Xã/ phường' value={editAddress.commune.name} onChange={value => { setAddCommuneP(value, editAddress.key, editAddress.id); }}>
                                                        {
                                                            listWards.map((ward, key) => {
                                                                return <option key={key} value={ward.WardCode.toString()}>{ward.WardName}</option>
                                                            })
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        <p>Địa chỉ chi tiết</p>
                                        <Textarea placeholder="địa chỉ chi tiết" value={editAddress.detail} onChange={e => { handleChangeReceiverDetail(editAddress.key, e.target.value, editAddress.id) }} />
                                    </div>

                                    <div className='flex items-center'>
                                        <Checkbox checked={defaultAddress == editAddress.id || defaultAddress == editAddress.key} onClick={() => { setDefaultAddress(editAddress.id || editAddress.key) }} />
                                        <p>Đặt làm địa chỉ mặc định</p>
                                    </div>
                                </form>
                            </Form>
                        </Modal>
                        <div className="rounded-md border bg-white p-3">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className='flex gap-4'>
                            <Button type="primary" onClick={() => { handleSubmitForm(form.getValues()) }}>Cập nhật khách hàng</Button>
                        </div>
                    </form>
                </Form>
            </div>


        </div >
    )
} 