package com.terminal.management.repository;

import com.terminal.management.model.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    Optional<Device> findByDeviceId(String deviceId);

    @Query("SELECT d FROM Device d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(d.hostname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(d.ipAddress) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(d.deviceId) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Device> findByFilters(@Param("status") String status,
                               @Param("keyword") String keyword,
                               Pageable pageable);
}
