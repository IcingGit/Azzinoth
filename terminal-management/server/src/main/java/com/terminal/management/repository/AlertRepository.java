package com.terminal.management.repository;

import com.terminal.management.model.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    @Query("SELECT a FROM Alert a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:deviceId IS NULL OR a.deviceId = :deviceId)")
    Page<Alert> findByFilters(@Param("status") String status,
                              @Param("deviceId") Long deviceId,
                              Pageable pageable);
}
