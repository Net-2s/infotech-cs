# Code Backend Spring Boot pour Checkout avec Stripe

## 1. Dépendance Maven (pom.xml)

Ajoute cette dépendance dans ton `pom.xml` :

```xml
<!-- Stripe -->
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.3.0</version>
</dependency>
```

## 2. Configuration (application.properties)

```properties
# Stripe Configuration
stripe.secret.key=sk_test_YOUR_SECRET_KEY_HERE
stripe.public.key=pk_test_YOUR_PUBLIC_KEY_HERE
```

## 3. Address Entity

**Fichier**: `src/main/java/com/infotech/marketplace/entity/Address.java`

```java
package com.infotech.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    private String street;
    
    @Column(nullable = false)
    private String city;
    
    @Column(nullable = false)
    private String postalCode;
    
    @Column(nullable = false)
    private String country;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private Boolean isDefault = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

## 4. Address Repository

**Fichier**: `src/main/java/com/infotech/marketplace/repository/AddressRepository.java`

```java
package com.infotech.marketplace.repository;

import com.infotech.marketplace.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
    
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void resetDefaultAddresses(@Param("userId") Long userId);
}
```

## 5. Address DTOs

**Fichier**: `src/main/java/com/infotech/marketplace/dto/AddressDTO.java`

```java
package com.infotech.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String street;
    private String city;
    private String postalCode;
    private String country;
    private String phone;
    private Boolean isDefault;
}
```

**Fichier**: `src/main/java/com/infotech/marketplace/dto/CreateAddressRequest.java`

```java
package com.infotech.marketplace.dto;

import lombok.Data;

@Data
public class CreateAddressRequest {
    private Long userId;
    private String firstName;
    private String lastName;
    private String street;
    private String city;
    private String postalCode;
    private String country;
    private String phone;
    private Boolean isDefault;
}
```

## 6. Address Service

**Fichier**: `src/main/java/com/infotech/marketplace/service/AddressService.java`

```java
package com.infotech.marketplace.service;

import com.infotech.marketplace.dto.AddressDTO;
import com.infotech.marketplace.dto.CreateAddressRequest;
import com.infotech.marketplace.entity.Address;
import com.infotech.marketplace.entity.User;
import com.infotech.marketplace.repository.AddressRepository;
import com.infotech.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {
    
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    
    public List<AddressDTO> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AddressDTO createAddress(CreateAddressRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Si c'est l'adresse par défaut, réinitialiser les autres
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.resetDefaultAddresses(request.getUserId());
        }
        
        Address address = new Address();
        address.setUser(user);
        address.setFirstName(request.getFirstName());
        address.setLastName(request.getLastName());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        
        Address savedAddress = addressRepository.save(address);
        return convertToDTO(savedAddress);
    }
    
    @Transactional
    public AddressDTO updateAddress(Long id, CreateAddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        // Si c'est l'adresse par défaut, réinitialiser les autres
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.resetDefaultAddresses(address.getUser().getId());
        }
        
        address.setFirstName(request.getFirstName());
        address.setLastName(request.getLastName());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        
        Address updatedAddress = addressRepository.save(address);
        return convertToDTO(updatedAddress);
    }
    
    @Transactional
    public void deleteAddress(Long id) {
        addressRepository.deleteById(id);
    }
    
    @Transactional
    public AddressDTO setDefaultAddress(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        addressRepository.resetDefaultAddresses(address.getUser().getId());
        address.setIsDefault(true);
        
        Address updatedAddress = addressRepository.save(address);
        return convertToDTO(updatedAddress);
    }
    
    private AddressDTO convertToDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setUserId(address.getUser().getId());
        dto.setFirstName(address.getFirstName());
        dto.setLastName(address.getLastName());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setPhone(address.getPhone());
        dto.setIsDefault(address.getIsDefault());
        return dto;
    }
}
```

## 7. Address Controller

**Fichier**: `src/main/java/com/infotech/marketplace/controller/AddressController.java`

```java
package com.infotech.marketplace.controller;

import com.infotech.marketplace.dto.AddressDTO;
import com.infotech.marketplace.dto.CreateAddressRequest;
import com.infotech.marketplace.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@RequiredArgsConstructor
public class AddressController {
    
    private final AddressService addressService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AddressDTO>> getUserAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }
    
    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(@RequestBody CreateAddressRequest request) {
        AddressDTO created = addressService.createAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long id,
            @RequestBody CreateAddressRequest request) {
        AddressDTO updated = addressService.updateAddress(id, request);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/set-default")
    public ResponseEntity<AddressDTO> setDefaultAddress(@PathVariable Long id) {
        AddressDTO updated = addressService.setDefaultAddress(id);
        return ResponseEntity.ok(updated);
    }
}
```

## 8. Stripe Service

**Fichier**: `src/main/java/com/infotech/marketplace/service/StripeService.java`

```java
package com.infotech.marketplace.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeService {
    
    @Value("${stripe.secret.key}")
    private String secretKey;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }
    
    public Map<String, String> createPaymentIntent(Long amount) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount) // Montant en centimes (ex: 5000 = 50€)
                .setCurrency("eur")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentIntentId", paymentIntent.getId());
        
        log.info("PaymentIntent créé: {}", paymentIntent.getId());
        
        return response;
    }
    
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }
    
    public boolean verifyPaymentSuccess(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return "succeeded".equals(paymentIntent.getStatus());
        } catch (StripeException e) {
            log.error("Erreur lors de la vérification du paiement: {}", e.getMessage());
            return false;
        }
    }
}
```

## 9. Mise à jour de Order Entity

Ajoute ces champs à ton entité `Order` existante :

```java
@Column(name = "payment_intent_id")
private String paymentIntentId;

@Column(name = "payment_status")
private String paymentStatus; // pending, succeeded, failed

@Column(name = "shipping_address")
private String shippingAddress; // JSON string ou relation vers Address
```

## 10. Mise à jour de CreateOrderRequest DTO

Ajoute ces champs à ton DTO existant :

```java
private String paymentIntentId;
private ShippingAddressDTO shippingAddress;
```

**Nouveau DTO pour l'adresse de livraison** :

```java
package com.infotech.marketplace.dto;

import lombok.Data;

@Data
public class ShippingAddressDTO {
    private String street;
    private String city;
    private String postalCode;
    private String country;
    private String phone;
}
```

## 11. Mise à jour de OrderController

Ajoute cette méthode dans ton `OrderController` :

```java
@PostMapping("/create-payment-intent")
public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Long> request) {
    try {
        Long amount = request.get("amount"); // Montant en centimes
        Map<String, String> response = stripeService.createPaymentIntent(amount);
        return ResponseEntity.ok(response);
    } catch (StripeException e) {
        log.error("Erreur Stripe: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

N'oublie pas d'injecter `StripeService` dans ton controller :

```java
private final StripeService stripeService;
```

## 12. Mise à jour de OrderService

Modifie ta méthode `createOrder` pour inclure la validation du paiement :

```java
@Transactional
public Order createOrder(CreateOrderRequest request) {
    // Vérifier que le paiement a réussi
    if (request.getPaymentIntentId() != null) {
        boolean paymentSuccess = stripeService.verifyPaymentSuccess(request.getPaymentIntentId());
        if (!paymentSuccess) {
            throw new RuntimeException("Le paiement n'a pas été confirmé");
        }
    }
    
    // ... reste de ton code existant
    
    // Ajouter les informations de paiement
    order.setPaymentIntentId(request.getPaymentIntentId());
    order.setPaymentStatus("succeeded");
    
    // Ajouter l'adresse de livraison (convertie en JSON ou autre format)
    if (request.getShippingAddress() != null) {
        // Tu peux stocker l'adresse en JSON ou créer une relation
        ObjectMapper mapper = new ObjectMapper();
        try {
            String addressJson = mapper.writeValueAsString(request.getShippingAddress());
            order.setShippingAddress(addressJson);
        } catch (JsonProcessingException e) {
            log.error("Erreur lors de la sérialisation de l'adresse", e);
        }
    }
    
    return orderRepository.save(order);
}
```

## 13. Script SQL pour la table addresses

```sql
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

## 14. Mise à jour de la table orders

```sql
ALTER TABLE orders 
ADD COLUMN payment_intent_id VARCHAR(255),
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN shipping_address TEXT;
```

## Configuration finale

1. **Remplace les clés Stripe** :
   - Dans `application.properties` : Ajoute ta clé secrète Stripe
   - Dans Angular `environment.ts` : Ajoute ta clé publique Stripe

2. **Teste avec les clés de test Stripe** :
   - Carte test : `4242 4242 4242 4242`
   - Date : N'importe quelle date future (ex: `12/25`)
   - CVV : N'importe quel 3 chiffres (ex: `123`)

3. **URLs importantes** :
   - Dashboard Stripe : https://dashboard.stripe.com/test/payments
   - Documentation : https://stripe.com/docs

## Sécurité importante

⚠️ **Ne JAMAIS commit les clés Stripe dans Git !**

Ajoute dans `.gitignore` :
```
application.properties
environment.ts
environment.prod.ts
```

Utilise des variables d'environnement en production !
