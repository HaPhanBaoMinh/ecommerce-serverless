import { Badge, TableCell } from "@windmill/react-ui";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "helpers/formatCurrency";

const OrderItem = ({ order }) => {
  return (
    <>
      <TableCell>#{order.order_id}</TableCell>
      <TableCell>{order.amount || "Not available"}</TableCell>
      <TableCell>
        {
          order.status === "pending" ? (
            <Badge type="warning">Pending</Badge>
          ) : order.status === "succeeded" ? (
            <Badge type="success">Succeeded</Badge>
          ) : (
            <Badge type="danger">Failed</Badge>
          )
        }
      </TableCell>
      <TableCell>{formatCurrency(order.total_price)}</TableCell>
      <TableCell>{format(parseISO(order?.order_date), "dd/MM/yy")}</TableCell>
    </>
  );
};

export default OrderItem;
