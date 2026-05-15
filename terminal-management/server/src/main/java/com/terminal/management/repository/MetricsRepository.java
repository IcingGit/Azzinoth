package com.terminal.management.repository;

import com.terminal.management.model.Metrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MetricsRepository extends JpaRepository<Metrics, Long> {

    Page<Metrics> findByDeviceIdOrderByCreatedAtDesc(Long deviceId, Pageable pageable);

    List<Metrics> findByDeviceIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long deviceId,
                                                                         LocalDateTime startTime,
                                                                         LocalDateTime endTime);

    Metrics findTopByDeviceIdOrderByCreatedAtDesc(Long deviceId);
}
