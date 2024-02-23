package com.example.webapp_shop_ecommerce.controller;

import com.example.webapp_shop_ecommerce.dto.request.products.ProductRequest;
import com.example.webapp_shop_ecommerce.dto.response.products.ProductResponse;
import com.example.webapp_shop_ecommerce.entity.Product;
import com.example.webapp_shop_ecommerce.dto.response.ResponseObject;
import com.example.webapp_shop_ecommerce.service.IProductService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1/product")
public class ProductController {

    @Autowired
    private ModelMapper mapper;
    @Autowired
    private IProductService productService;
    
    @GetMapping
    public ResponseEntity<?> findProductAll(@RequestParam(value = "page", defaultValue = "-1") Integer page,
                                            @RequestParam(value = "size", defaultValue = "-1") Integer size,
                                            @RequestParam(value = "search", defaultValue = "") String search
    ) {
        Pageable pageable = Pageable.unpaged();
        if (size < 0) {
            size = 5;
        }
        if (page >= 0) {
            pageable = PageRequest.of(page, size);
        }
        System.out.println("page=" + page + " size=" + size + "search=" + search);
        List<Product> lstPro = productService.findProductsAndDetailsNotDeleted(pageable, search).getContent();
        List<ProductResponse> resultDto  = lstPro.stream().map(pro -> mapper.map(pro, ProductResponse.class)).collect(Collectors.toList());
        return new ResponseEntity<>(resultDto, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findProductById(@PathVariable("id") Long id) {
        Optional<Product> otp = productService.findProductByIdAndDetailsNotDeleted(id);
        if (otp.isEmpty()) {
            return new ResponseEntity<>(new ResponseObject("Fail", "Không tìm thấy id " + id, 1, null), HttpStatus.BAD_REQUEST);
        }
        ProductResponse product = otp.map(pro -> mapper.map(pro, ProductResponse.class)).orElseThrow(IllegalArgumentException::new);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProduct(@RequestParam(value = "name") String name) {
        List<Product> lstPro = productService.findProductByName(name.trim());
        return new ResponseEntity<>(lstPro.stream().map(pro -> mapper.map(pro, ProductRequest.class)).collect(Collectors.toList()), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<?> saveProduct(@RequestBody ProductRequest productDto) {


//        return productService.createNew(mapper.map(productDto, Product.class));
        return productService.saveOrUpdate(productDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
        System.out.println("Delete ID: " + id);
        return productService.delete(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@RequestBody ProductRequest productDto, @PathVariable("id") Long id) {

;
        return productService.saveOrUpdate(productDto, id);
    }


    @GetMapping(value = "/barcode", produces = "application/zip")
    public ResponseEntity<Resource> generateBarcodes(@RequestParam(value = "data", defaultValue = "") List<String> dataList)  {

        try {
            return productService.generateBarcodes(dataList);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping(value = "/excell")
    public ResponseEntity<Resource> exportExcel(@RequestParam(value = "data", defaultValue = "") List<String> dataList)  {

        try {
            return productService.exportExcel(dataList);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
