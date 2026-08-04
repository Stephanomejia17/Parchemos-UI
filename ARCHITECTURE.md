# Arquitectura de Parchemos

`apps` contiene los productos desplegables: Customer y Console preservan sus vistas existentes; Business es solo un esqueleto para el futuro.

`shared` es la única fuente para tokens de diseño y componentes reutilizables. Las interfaces específicas de un producto se mantienen dentro de sus `features`.

`core` reserva las capas de Clean Architecture que podrán compartir los tres productos: dominio (entidades y contratos), aplicación (casos de uso) e infraestructura (adaptadores). Las dependencias deben apuntar hacia el dominio, nunca desde éste hacia una app o framework.
