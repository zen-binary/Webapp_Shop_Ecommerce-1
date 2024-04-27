package com.example.webapp_shop_ecommerce.repositories;

import com.example.webapp_shop_ecommerce.dto.response.statistical.StaticalProductResponse;
import com.example.webapp_shop_ecommerce.dto.response.statistical.StatisticalReponse;
import com.example.webapp_shop_ecommerce.dto.response.statistical.TopSaleReponse;
import com.example.webapp_shop_ecommerce.dto.response.statistical.ToppSaleResponse;
import com.example.webapp_shop_ecommerce.entity.Bill;
import lombok.extern.java.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface IStatisticalRepository extends JpaRepository<Bill, Long> {
//    @Query(value = "select Product.name, sum(BillDetails.quantity) as quantity, DATE(Bill.last_modified_date) AS 'time' from Bill join BillDetails on bill_id = Bill.id join ProductDetail on product_detail_id = ProductDetail.id join  Product on product_id = Product.id where Bill.status ='4'\n" +
//            "group by Product.name, BillDetails.quantity,DATE(Bill.last_modified_date)",
//    nativeQuery = true)
//    List<TopSaleReponse> getAllTopSale();

    @Query(value = "select Product.name as name, sum(BillDetails.quantity) as quantity from Bill join BillDetails on bill_id = Bill.id join ProductDetail on product_detail_id = ProductDetail.id join  Product on product_id = Product.id " +
            "where Bill.status ='4' AND Bill.last_modified_date BETWEEN :startDate AND :endDate " +
            "group by Product.name, BillDetails.quantity",
            nativeQuery = true)
    List<TopSaleReponse> getTopSaleDay(@Param("startDate") LocalDateTime  startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "select Product.name, sum(BillDetails.quantity) as quantity, CASE WHEN TIMESTAMPDIFF(DAY, :startDate, :endDate) <= 14 THEN DATE(Bill.last_modified_date) WHEN TIMESTAMPDIFF(DAY, :startDate, :endDate) > 14 AND TIMESTAMPDIFF(DAY, :startDate, :endDate) <= 56 THEN WEEK(Bill.last_modified_date)  ELSE MONTH(Bill.last_modified_date) END AS time from Bill join BillDetails on bill_id = Bill.id join ProductDetail on product_detail_id = ProductDetail.id join  Product on product_id = Product.id " +
            "where Bill.status ='4' " +
            "group by Product.name,BillDetails.quantity ,time",
            nativeQuery = true)
    List<TopSaleReponse> getAllTopSale(@Param("startDate") LocalDateTime  startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "select count(Bill.id) as completedOrders, sum(Bill.into_money) as revenue,  CASE WHEN TIMESTAMPDIFF(DAY, :startDate, :endDate) <= 14 THEN DATE(Bill.last_modified_date) WHEN TIMESTAMPDIFF(DAY, :startDate, :endDate) > 14 AND TIMESTAMPDIFF(DAY, :startDate, :endDate) <= 56 THEN WEEK(Bill.last_modified_date)  ELSE MONTH(Bill.last_modified_date) END AS time from Bill join BillDetails on bill_id = Bill.id join ProductDetail on product_detail_id = ProductDetail.id join  Product on product_id = Product.id " +
            "where Bill.status ='4' group by time",
            nativeQuery = true)
    List<StatisticalReponse> getAllStatistical(@Param("startDate") LocalDateTime  startDate, @Param("endDate") LocalDateTime endDate);



}
