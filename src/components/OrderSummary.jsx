// import React from "react";

// function OrderSummary({ cartItems, deliveryType }) {
//   const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
//   const deliveryFee = deliveryType === "Door Delivery" ? 75 : 50;
//   const total = subtotal + deliveryFee;

//   return (
//     <section className="checkout-section order-summary">
//       <h3>Order Summary</h3>
//       <ul>
//         {cartItems.map((item, index) => (
//           <li key={index}>
//             {item.name} - GHS {item.price}
//           </li>
//         ))}
//       </ul>
//       <p>Item's total: GHS {subtotal}</p>
//       <p>Delivery fees: GHS {deliveryFee}</p>
//       <p><strong>Total: GHS {total}</strong></p>
//     </section>
//   );
// }

// export default OrderSummary;
