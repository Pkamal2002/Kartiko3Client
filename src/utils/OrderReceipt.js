import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export const generateOrderReceipt = (order) => {
    try {
        console.log('Initiating PDF Generation for Order:', order._id);
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Primary Color
        doc.text('KARTIKO.', 15, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(110, 110, 110);
        doc.text('Premium E-Commerce Platform', 15, 26);
        
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('ORDER RECEIPT', 150, 20);
        
        doc.setFontSize(10);
        doc.text(`Order ID: #${order._id.substring(18).toUpperCase()}`, 150, 26);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 31);

        // Divider
        doc.setDrawColor(229, 231, 235);
        doc.line(15, 40, 195, 40);

        // Customer & Shipping Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Shipping Details', 15, 50);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${order.user?.name || 'N/A'}`, 15, 56);
        doc.text(`Address: ${order.shippingAddress.street}`, 15, 61);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 15, 66);
        doc.text(`Phone: ${order.shippingAddress.phone || 'N/A'}`, 15, 71);

        // Payment Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Info', 120, 50);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Method: ${order.paymentMethod}`, 120, 56);
        doc.text(`Paid: ${order.isPaid ? 'YES' : 'NO'}`, 120, 61);
        doc.text(`Status: ${order.orderStatus}`, 120, 66);

        // Items Table
        const tableColumn = ["Product", "Price", "Qty", "Subtotal"];
        const tableRows = [];

        order.orderItems.forEach(item => {
            const itemData = [
                item.name,
                `INR ${(item.price || 0).toLocaleString('en-IN')}`,
                item.qty,
                `INR ${((item.price || 0) * (item.qty || 0)).toLocaleString('en-IN')}`
            ];
            tableRows.push(itemData);
        });

        console.log('Orchestrating AutoTable...');
        autoTable(doc, { 
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
            styles: { fontSize: 9 }
        });

        // Summary
        const finalY = (doc.lastAutoTable?.finalY || 150) + 10;
        
        doc.setFontSize(10);
        doc.text(`Items Price:`, 130, finalY);
        doc.text(`INR ${(order.itemsPrice || 0).toLocaleString('en-IN')}`, 190, finalY, { align: 'right' });
        
        doc.text(`Tax:`, 130, finalY + 5);
        doc.text(`INR ${(order.taxPrice || 0).toLocaleString('en-IN')}`, 190, finalY + 5, { align: 'right' });
        
        doc.text(`Shipping:`, 130, finalY + 10);
        doc.text(`INR ${(order.shippingPrice || 0).toLocaleString('en-IN')}`, 190, finalY + 10, { align: 'right' });
        
        if (order.discountPrice > 0) {
            doc.setTextColor(220, 38, 38);
            doc.text(`Discount:`, 130, finalY + 15);
            doc.text(`- INR ${(order.discountPrice || 0).toLocaleString('en-IN')}`, 190, finalY + 15, { align: 'right' });
            doc.setTextColor(0, 0, 0);
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.line(130, finalY + 20, 195, finalY + 20);
        doc.text(`Total Price:`, 130, finalY + 26);
        doc.text(`INR ${(order.totalPrice || 0).toLocaleString('en-IN')}`, 190, finalY + 26, { align: 'right' });

        // Footer Note
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Thank you for shopping with Kartiko! This is a system-generated receipt.', 15, 280);

        // Save PDF
        console.log('Finalizing PDF stream...');
        doc.save(`Kartiko_Receipt_${order._id.substring(18).toUpperCase()}.pdf`);
        toast.success('Invoice generated successfully');
    } catch (error) {
        console.error('PDF Orchestration Failure:', error);
        toast.error('Logistics Error: Receipt generation sequence failed');
    }
};
