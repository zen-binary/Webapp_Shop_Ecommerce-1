import { editableInputTypes } from '@testing-library/user-event/dist/utils';
import axios from 'axios';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Tạo một Context mới để lưu trữ thông tin đơn hàng
const OrderContext = createContext();

// Custom hook để sử dụng Context
export const useOrderData = () => {
    return useContext(OrderContext);
};

const OrderDataProvider = ({ children }) => {
    const [idBill, setIdBill] = useState(null);
    const [lstBill, setLstBill] = useState([]);

    const [addressBill, setAddressBill] = useState({});

    const [totalPrice, setTotalPrice] = useState(0);
    const [intoMoney, setIntoMoney] = useState(0);
    const [shipMoney, setShipMoney] = useState(0);
    const [voucherMoney, setVoucerMoney] = useState(0);
    const [moneyPaid, setMoneyPaid] = useState(0);

    const [paymentMethods, setPaymentMethods] = useState(0);
    const [paymentCustomer, setPaymentCustomer] = useState(0);

    const [idCustomer, setIdCustomer] = useState(null);
    const [customer, setCustomer] = useState(null);

    const [isDelivery, setIsDelivery] = useState(false);
    const [voucher, setVoucher] = useState(null);

    const [lstProductDetails, setLstProductDetails] = useState([]);
    const [lstProductDetailsCart, setLstProductDetailsCart] = useState([]);

    const DiscountType = {
        GIAM_TRUC_TIEP: '0',
        GIAM_PHAN_TRAM: "1",
    }

    //set tổng tiền
    useEffect(() => {
        const money = totalPrice - voucherMoney + shipMoney;


        if (money <= 0) {
            setIntoMoney(0);

        } else {
            setIntoMoney(money);
        }
    }, [totalPrice, voucherMoney, shipMoney])


    useEffect(() => {
        if (totalPrice <= 0 || voucher == null) {
            setVoucerMoney(0);
            return;
        }
        //%
        if (voucher.discountType == DiscountType.GIAM_PHAN_TRAM) {
            const discount = totalPrice * voucher.value / 100;
            setVoucerMoney(discount);
        } else {
            setVoucerMoney(voucher.value);
        }

    }, [voucher, totalPrice])

    //Tiền trả kháhc
    useEffect(() => {
        setMoneyPaid(paymentCustomer - intoMoney);
    }, [paymentCustomer])
    const setDataVoucher = (data) => {
        setVoucher(data);
    };
    const setDataIdBill = (data) => {
        setIdBill(data);
    };
    const setDataPaymentMethods = (data) => {
        console.log(data);
        setPaymentMethods(data);
    };
    const setDataPaymentCustomer = (data) => {
        setPaymentCustomer(data);
    };
    const setDataIdCustomer = (data) => {
        console.log(data);
        setIdCustomer(data);
    };
    const setDataPriceCart = (price) => {
        setTotalPrice(price);
    };
    const setDataAddressBill = (data) => {
        setAddressBill(data);
    };

    const setDataIsDelivery = () => {
        setIsDelivery(!isDelivery)
    };

    const setDataShipMoney = (data) => {
        setShipMoney(data);
    };
    useEffect(() => {
        if (lstBill.length === 0) {
            setIdBill(null);
            // setLstProductDetailsCart([])
        }
    }, [lstBill])

    useEffect(() => {
        setIsDelivery(false);
    }, [customer])

    const fetchDataCart = async () => {
        if (idBill == null) {
            return;
        }
        try {
            const response = await axios.get('http://localhost:8080/api/v1/counters/' + idBill);
            console.log(response.data);
            console.log("call lại api cart");
            setLstProductDetailsCart(response.data);


        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchDataCart();
        console.log(idBill);
    }, [idBill]);

    const updateDataDataCart = () => {
        fetchDataCart();
    };


    const fetchDataProductDetails = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/counters/products');
            console.log(response.data);
            setLstProductDetails(response.data)

        } catch (error) {
            console.error(error);
        }


    }

    useEffect(() => {
        fetchDataProductDetails();
    }, []);

    const updateDataProductDetails = useCallback(async () => {
        fetchDataProductDetails();
    }, []);


    const fetchDataBillNew = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/counters');
            console.log(response.data);
            setLstBill(response.data);

        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        fetchDataBillNew();
    }, []);

    const updateDataLstBill = useCallback(async () => {
        fetchDataBillNew();
    }, []);

    const fetchDataBill = async () => {
        if (idBill == null) {
            return;
        }

        axios.get('http://localhost:8080/api/v1/bill/' + idBill)
            .then(res => {
                console.log(res.data.customer);
                setCustomer(res.data.customer);
                setAddressBill(null);
            })
            .catch(err => {
                console.log(err);
            });
    }
    useEffect(() => {
        fetchDataBill();
    }, [idBill])

    const updateDataCustomer = useCallback(async (id) => {
        console.log(idBill);
        axios.put(`http://localhost:8080/api/v1/counters/${idBill}/customer`, {
            customer: id
        })
            .then(response => {
                toast.success(response.data.message)
                fetchDataBill()
            })
            .catch(error => {
                toast.error(error.response.data.message)

            })
    }, [idBill]);

    const handlePaymentBill = () => {
        //4 - Hoàn Thành
        //1- Chờ Giao
        let status = '4';
        // if (isDelivery) {
        //     status = '1';
        // }

        let returnUrl = window.location.origin;



        //Validate tạm số tiền
        if (idBill == null) {
            return;
        }
        // if (paymentCustomer < intoMoney) {
        //     toast.error('Số Tiền Khách Nhập Chưa Đủ')
        //     return;
        // }
        const dataBill = {
            paymentMethod: paymentMethods,
            totalMoney: totalPrice,
            intoMoney: intoMoney,
            voucherMoney: voucherMoney,
            shipMoney: shipMoney,
            receiverName: addressBill?.receiverName,
            receiverPhone: addressBill?.receiverPhone,
            receiverDetails: addressBill?.detail,
            receiverCommune: addressBill?.commune,
            receiverDistrict: addressBill?.district,
            receiverProvince: addressBill?.province,
            description: addressBill?.description,
            isDelivery: isDelivery,
            status: status,
            //Id này là của voucherdetails
            voucher: voucher?.id,
            returnUrl: returnUrl
        }
        console.log(dataBill);
        axios.put(`http://localhost:8080/api/v1/counters/${idBill}/payment`, dataBill)
            .then((response) => {
                if (response.data.status == "redirect") {
                    window.location.href = response.data.data;
                } else {
                    console.log(response.data);
                    toast.success(response.data.message);
                    updateDataLstBill();
                    resetData();
                }

            })
            .catch((error) => {
                toast.error(error.response.data.message);
            })

    };
    const resetData = () => {
        console.log('reset data');
        setCustomer(null)
        setIsDelivery(false)
        setIntoMoney(0);
        setTotalPrice(0);
        setShipMoney(0);
        setVoucerMoney(0);
        setPaymentCustomer(0);
        setMoneyPaid(0);
        setPaymentMethods(0);
    };

    const dataContextValue = {
        idBill,
        lstBill,
        totalPrice,
        intoMoney,
        shipMoney,
        voucherMoney,
        paymentCustomer,
        moneyPaid,
        paymentMethods,
        customer,
        addressBill,
        voucher,
        idCustomer,
        isDelivery,

        lstProductDetails,
        lstProductDetailsCart,

        setDataPriceCart,
        setDataAddressBill,
        setDataIsDelivery,
        setDataIdCustomer,
        setDataPaymentCustomer,
        setDataPaymentMethods,
        setDataIdBill,
        setDataShipMoney,
        setDataVoucher,

        updateDataLstBill,
        updateDataProductDetails,
        updateDataDataCart,
        updateDataCustomer,

        handlePaymentBill,

    };

    return (
        <OrderContext.Provider value={dataContextValue}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderDataProvider;
