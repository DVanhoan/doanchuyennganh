package com.example.attendance.model;

import com.example.attendance.model.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "employee_id", "angle" }))
public class FaceEmbedding extends BaseEntity {

    private String angle;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String embedding;

    @ManyToOne
    private Employee employee;
}
