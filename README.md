# Taller Contrapeso

Juego de plataformas 2D para MAT2001. Lía debe restablecer tres máquinas para que salga el último funicular. Cada máquina se calibra con un cálculo de centro de masa o centroide.

## Jugar

Descarga el ZIP, extráelo completo y abre **index.html** en Chrome o Edge. El juego funciona sin conexión. Te conviene usar una computadora con teclado para la demo.

| Control | Acción |
| --- | --- |
| A/D o ←/→ | Caminar |
| Espacio, W o ↑ | Saltar |
| E | Recoger, soltar, entregar una pieza u operar el tablero cercano |
| R | Reaparecer en el último punto de control |
| Clic y flechas en el gráfico | Colocar la marca y afinar en pasos de 0,01 |
| Escape o × | Cerrar el tablero o el cuaderno |

Cerca de las máquinas también puedes pulsar el aviso de interacción que aparece dentro de la escena. En pantallas táctiles hay controles debajo del escenario. El botón **Reiniciar sala** vuelve al inicio de la misión actual. **Cuaderno** abre las fórmulas. En cada tablero, **Consultar el cálculo** explica cómo usar los datos de esa configuración. Las casillas admiten coma decimal, punto decimal y fracciones.

## Ruta del taller

1. **La pasarela de carga.** Salta el hueco, recoge la batería de 8 kg y entrégala en el tablero. Pulsa E otra vez para operarlo. Arrastra la batería al destino, calcula el momento y coloca la marca. Cruza la pasarela y llega a la bandera.
2. **El elevador del taller.** Haz dos viajes al tablero para entregar las placas. Encaja la placa superior al lado que prefieras y marca el centroide de la pieza en L. Tras calibrar, sube al elevador y camina hasta la bandera.
3. **La última compuerta.** Salta a la plataforma del tablero. Mueve el escáner hasta x = 1 dm. Compara el área aproximada con 4 y 16 franjas, identifica la altura media de la franja de muestra y calibra el centroide de la compuerta. Camina hasta el vagón para completar el viaje.

## Demo en clase · 5 minutos

| Tiempo | Participación |
| --- | --- |
| 0:00–1:30 | Integrante 1. Entrega la batería y explica por qué su posición pesa ocho veces en la suma. Muestra el giro al cambiarla de banco y nivela la pasarela. |
| 1:30–3:00 | Integrante 2. Arma la pieza en L. Predice qué coordenada cambia cuando se refleja la placa superior y compruébalo en el elevador. |
| 3:00–4:30 | Integrante 3. Barre la compuerta, muestra el centro de la franja en x = 1 y explica de dónde sale el factor ½ del momento. Abre la compuerta. |
| 4:30–5:00 | Los tres contrastan un cálculo de su hoja con el resultado en pantalla y muestran el funicular en marcha. |

El código y los recursos están en esta carpeta. El paisaje se generó con ImageGen. El personaje, las máquinas y la cuadrícula se dibujan en Canvas. El juego utiliza archivos locales y no requiere claves, servidor ni dependencias adicionales.
