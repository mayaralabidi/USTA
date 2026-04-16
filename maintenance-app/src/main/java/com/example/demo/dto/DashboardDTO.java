package com.example.demo.dto;
 
import lombok.*;
import java.math.BigDecimal;
import java.util.Map;
 
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardDTO {
    private long totalPannes;
    private long pannesEnCours;
    private long pannesResolues;
    private long interventionsPlanifiees;
    private long interventionsEnCours;
    private long interventionsTerminees;
    private long techniciensDispo;
    private BigDecimal coutTotalMois;
    private Map<String, Long> pannesParCategorie;
    private Map<String, Long> interventionsParStatut;
}