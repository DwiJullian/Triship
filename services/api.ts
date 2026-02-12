
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/browser';
import { Product, Review, ShippingDetails, PaymentMethod, CartItem, OrderStatus } from '../types';
import { sanitizeInput, validateEmail, validatePhone, validateAdminEmail } from './security';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hiydiaruhmzfnfzjbopm.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpeWRpYXJ1aG16Zm5mempib3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDk0NjYsImV4cCI6MjA4NTg4NTQ2Nn0.4VNsquPMqnfyIZsVO4CnZorehsQOLXxe1jGG1TmBN3A';

// Initialize EmailJS
emailjs.init('Vtqvu8LFWEPvMN2Xx');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Persistence Helpers
const saveOrderLocally = (order: any) => {
  const localOrders = JSON.parse(localStorage.getItem('dropshippro_mock_orders') || '[]');
  localOrders.push(order);
  localStorage.setItem('dropshippro_mock_orders', JSON.stringify(localOrders));
};

const saveProductLocally = (product: any) => {
  const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
  localProducts.push(product);
  localStorage.setItem('dropshippro_mock_products', JSON.stringify(localProducts));
};

// Update product sales count after successful order
const updateProductSalesCount = async (productId: string, quantityBought: number) => {
  try {
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    const currentProduct = products?.[0];
    if (!currentProduct) throw new Error('Product not found');
    
    const currentSalesCount = currentProduct.sales_count || 0;
    const newSalesCount = currentSalesCount + quantityBought;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ sales_count: newSalesCount })
      .eq('id', productId);
    
    if (updateError) throw updateError;
    console.log(`Updated sales_count for product ${productId}: ${currentSalesCount} -> ${newSalesCount}`);
  } catch (dbError) {
    console.warn('Failed to update sales_count in Supabase, trying localStorage:', dbError);
    const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
    const productIndex = localProducts.findIndex((p: any) => p.id === productId);
    
    if (productIndex !== -1) {
      localProducts[productIndex].sales_count = (localProducts[productIndex].sales_count || 0) + quantityBought;
      localStorage.setItem('dropshippro_mock_products', JSON.stringify(localProducts));
      console.log(`Updated sales_count for product ${productId} in localStorage`);
    }
  }
};

// Decrease product sales count when an order is cancelled
const decreaseProductSalesCount = async (productId: string, quantityToRemove: number) => {
  try {
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .limit(1);

    if (fetchError) throw fetchError;

    const currentProduct = products?.[0];
    if (!currentProduct) throw new Error('Product not found');

    const currentSalesCount = currentProduct.sales_count || 0;
    const newSalesCount = Math.max(0, currentSalesCount - quantityToRemove);

    const { error: updateError } = await supabase
      .from('products')
      .update({ sales_count: newSalesCount })
      .eq('id', productId);

    if (updateError) throw updateError;
    console.log(`Decreased sales_count for product ${productId}: ${currentSalesCount} -> ${newSalesCount}`);
  } catch (dbError) {
    console.warn('Failed to decrease sales_count in Supabase, trying localStorage:', dbError);
    const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
    const productIndex = localProducts.findIndex((p: any) => p.id === productId);

    if (productIndex !== -1) {
      const current = localProducts[productIndex].sales_count || 0;
      localProducts[productIndex].sales_count = Math.max(0, current - quantityToRemove);
      localStorage.setItem('dropshippro_mock_products', JSON.stringify(localProducts));
      console.log(`Decreased sales_count for product ${productId} in localStorage`);
    }
  }
};

export const api = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (authErr) {
      try {
        const normalized = (email || '').trim();
        let { data: rows, error: qErr } = await supabase
          .from('staff_accounts')
          .select('*')
          .eq('email', normalized)
          .limit(1);
        if (qErr) throw qErr;
        let row: any = (rows && rows[0]) || null;
        if (!row) {
          const { data: rows2, error: qErr2 } = await supabase
            .from('staff_accounts')
            .select('*')
            .eq('username', normalized)
            .limit(1);
          if (qErr2) throw qErr2;
          row = (rows2 && rows2[0]) || null;
        }
        if (row) {
          if ((row.password || '') === password) {
            return { user: { id: row.id, email: row.email, username: row.username } } as any;
          } else {
            throw new Error('Invalid credentials');
          }
        }
        throw authErr;
      } catch (fallbackErr: any) {
        const msg = (fallbackErr && (fallbackErr.message || '')).toString();
        if (fallbackErr && (fallbackErr.code === 'PGRST205' || msg.includes('Could not find the table'))) {
          const local = JSON.parse(localStorage.getItem('dropshippro_staff_accounts') || '[]');
          const normalized = (email || '').trim();
          let row = local.find((r: any) => (r.email === normalized || r.username === normalized));
          if (row && row.password === password) {
            return { user: { id: row.id, email: row.email, username: row.username } } as any;
          }
        }
        throw fallbackErr || authErr;
      }
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data: dbProducts } = await supabase.from('products').select('*');
      const { data: reviews } = await supabase.from('reviews').select('*');
      const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
      const combined = [...(dbProducts || []), ...localProducts];
      return combined.map(p => ({
        ...p,
        price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
        salesCount: p.sales_count || 0,
        createdAt: p.created_at,
        reviews: (reviews || []).filter(r => r.product_id === p.id).map(r => ({
          id: r.id,
          productId: r.product_id,
          userName: r.user_name,
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString(),
          parentId: r.parent_id,
          isAdmin: r.is_admin
        }))
      }));
    } catch (err) {
      return JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
    }
  },
  addReview: async (review: any) => {
    const { data, error } = await supabase.from('reviews').insert([{
      product_id: review.productId,
      user_name: review.userName,
      rating: review.rating,
      comment: review.comment,
      parent_id: review.parentId,
      is_admin: review.isAdmin || false,
      created_at: new Date().toISOString()
    }]).select();
    if (error) throw error;
    return data[0];
  },
  createOrder: async (orderData: {
    items: CartItem[],
    customer_info: ShippingDetails,
    total_price: number,
    shipping_cost?: number,
    payment_fee?: number,
    return_fee?: number,
    wants_return?: boolean,
    payment_method: PaymentMethod
  }) => {
    const orderPayload = {
      id: `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: {
        products: orderData.items,
        customer: orderData.customer_info,
        paymentMethod: orderData.payment_method
      },
      status: 'paid' as OrderStatus,
      total_price: orderData.total_price,
      shipping_cost: orderData.shipping_cost || 0,
      payment_fee: orderData.payment_fee || 0,
      return_fee: orderData.return_fee || 0,
      wants_return: !!orderData.wants_return,
      created_at: new Date().toISOString()
    };
    console.log('[createOrder] Attempting to create order:', orderPayload.id);
    try {
      const { data, error } = await supabase.from('orders').insert([orderPayload]).select();
      if (error) throw error;
      console.log('[createOrder] Order created in Supabase:', orderPayload.id);
      for (const item of orderData.items) {
        await updateProductSalesCount(item.id, item.quantity);
      }
      
      // Send order confirmation email to customer
      try {
        const productsList = orderData.items.map((item: CartItem) => `${item.name} x${item.quantity}`).join(', ');
        await emailjs.send('service_mp3u1vk', 'template_order_confirmation', {
          customer_name: orderData.customer_info.name,
          customer_email: orderData.customer_info.email,
          order_id: orderPayload.id,
          order_date: new Date().toLocaleDateString('id-ID'),
          products: productsList,
          total_amount: orderData.total_price.toLocaleString(),
          payment_method: orderData.payment_method,
          shipping_address: orderData.customer_info.address,
          status: 'Order Confirmed'
        });
        console.log('[createOrder] Confirmation email sent to customer');
      } catch (emailErr) {
        console.warn('[createOrder] Failed to send confirmation email:', emailErr);
      }
      
      return { success: true, orderId: data[0].id };
    } catch (dbError) {
      console.warn('[createOrder] Supabase insert failed, saving locally:', dbError);
      saveOrderLocally(orderPayload);
      console.log('[createOrder] Order saved to localStorage:', orderPayload.id);
      for (const item of orderData.items) {
        await updateProductSalesCount(item.id, item.quantity);
      }
      
      // Send order confirmation email to customer even if saved locally
      try {
        const productsList = orderData.items.map((item: CartItem) => `${item.name} x${item.quantity}`).join(', ');
        await emailjs.send('service_mp3u1vk', 'template_order_confirmation', {
          customer_name: orderData.customer_info.name,
          customer_email: orderData.customer_info.email,
          order_id: orderPayload.id,
          order_date: new Date().toLocaleDateString('id-ID'),
          products: productsList,
          total_amount: orderData.total_price.toLocaleString(),
          payment_method: orderData.payment_method,
          shipping_address: orderData.customer_info.address,
          status: 'Order Confirmed'
        });
        console.log('[createOrder] Confirmation email sent to customer');
      } catch (emailErr) {
        console.warn('[createOrder] Failed to send confirmation email:', emailErr);
      }
      
      return { success: true, orderId: orderPayload.id };
    }
  },
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    // Get existing order from either Supabase or localStorage
    let existingOrder: any = null;
    let foundFrom = 'none';
    
    // Try Supabase first
    try {
      const { data: orders, error } = await supabase.from('orders').select('*').eq('id', orderId).limit(1);
      if (!error && orders && orders[0]) {
        existingOrder = orders[0];
        foundFrom = 'supabase';
        console.log(`[updateOrderStatus] Found order in Supabase`);
      }
    } catch (e) {
      console.warn('Failed to query Supabase for order:', e);
    }

    // If not found in Supabase, check localStorage
    if (!existingOrder) {
      try {
        const localOrders = JSON.parse(localStorage.getItem('dropshippro_mock_orders') || '[]');
        const found = localOrders.find((o: any) => o.id === orderId);
        if (found) {
          existingOrder = found;
          foundFrom = 'localStorage';
          console.log(`[updateOrderStatus] Found order in localStorage`);
        }
      } catch (e) {
        console.warn('Failed to check localStorage for order:', e);
      }
    }

    const prevStatus = existingOrder?.status || null;
    console.log(`[updateOrderStatus] Order: ${orderId}, Previous Status: ${prevStatus}, New Status: ${status}, Found From: ${foundFrom}`);

    if (!existingOrder) {
      console.warn(`[updateOrderStatus] Order not found in either Supabase or localStorage!`);
    }

    // Update in Supabase
    let supabaseUpdated = false;
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      supabaseUpdated = true;
      console.log(`[updateOrderStatus] Updated in Supabase successfully`);
    } catch (e) {
      console.warn('Failed to update order in Supabase:', e);
    }

    // Also update in localStorage to keep them in sync
    try {
      const localOrders = JSON.parse(localStorage.getItem('dropshippro_mock_orders') || '[]');
      const updatedLocal = localOrders.map((o: any) => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('dropshippro_mock_orders', JSON.stringify(updatedLocal));
      console.log(`[updateOrderStatus] Updated in localStorage`);
    } catch (e) {
      console.warn('Failed to update localStorage:', e);
    }

    // Decrease sales count if cancelling a paid order
    if (status === 'cancelled' && prevStatus === 'paid' && existingOrder) {
      console.log(`[updateOrderStatus] Cancelling paid order, decreasing sales counts...`);
      const products = (existingOrder?.items?.products) || [];
      console.log(`[updateOrderStatus] Found ${products.length} products to update`);
      for (const p of products) {
        try {
          console.log(`[updateOrderStatus] Decreasing sales for product ${p.id} by ${p.quantity || 0}`);
          await decreaseProductSalesCount(p.id, p.quantity || 0);
        } catch (err) {
          console.warn('Failed to decrease sales count for product', p.id, err);
        }
      }
    } else {
      console.log(`[updateOrderStatus] Not cancelling (status='${status}', prevStatus='${prevStatus}', exists=${existingOrder ? 'yes' : 'no'})`);
    }

    return supabaseUpdated || true;
  },
  updateSupplierOrderId: async (orderId: string, supplierOrderId: string) => {
    // Update in Supabase
    let supabaseUpdated = false;
    try {
      const { error } = await supabase.from('orders').update({ supplier_order_id: supplierOrderId }).eq('id', orderId);
      if (error) throw error;
      supabaseUpdated = true;
      console.log(`[updateSupplierOrderId] Updated in Supabase successfully`);
    } catch (e) {
      console.warn('Failed to update supplier order ID in Supabase:', e);
    }

    // Also update in localStorage to keep them in sync
    try {
      const localOrders = JSON.parse(localStorage.getItem('dropshippro_mock_orders') || '[]');
      const updatedLocal = localOrders.map((o: any) => o.id === orderId ? { ...o, supplier_order_id: supplierOrderId } : o);
      localStorage.setItem('dropshippro_mock_orders', JSON.stringify(updatedLocal));
      console.log(`[updateSupplierOrderId] Updated in localStorage`);
    } catch (e) {
      console.warn('Failed to update localStorage:', e);
    }

    return supabaseUpdated || true;
  },
  getOrders: async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const localOrders = JSON.parse(localStorage.getItem('dropshippro_mock_orders') || '[]');
      
      // Create a map to deduplicate orders by ID, preferring Supabase data
      const ordersMap = new Map();
      
      // Add local orders first
      localOrders.forEach((o: any) => {
        ordersMap.set(o.id, o);
      });
      
      // Add Supabase orders, which will override local ones with same ID
      (data || []).forEach((o: any) => {
        ordersMap.set(o.id, o);
      });
      
      return Array.from(ordersMap.values()).map(o => ({
        ...o,
        total_price: typeof o.total_price === 'string' ? parseFloat(o.total_price) : (o.total_price || 0),
        shipping_cost: typeof o.shipping_cost === 'string' ? parseFloat(o.shipping_cost) : (o.shipping_cost || 0),
        payment_fee: typeof o.payment_fee === 'string' ? parseFloat(o.payment_fee) : (o.payment_fee || 0),
        return_fee: typeof o.return_fee === 'string' ? parseFloat(o.return_fee) : (o.return_fee || 0),
        wants_return: !!o.wants_return
      })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (err) {
      return JSON.parse(localStorage.getItem('dropshippro_mock_orders') || '[]');
    }
  },
  getCustomerEmails: async (): Promise<string[]> => {
    const orders = await api.getOrders();
    const emails = new Set<string>(orders.map((o: any) => (o.items as any)?.customer?.email).filter(Boolean));
    return Array.from(emails);
  },
  addProduct: async (p: any) => {
    const productPayload = {
      id: `PROD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: p.name,
      price: parseFloat(p.price),
      description: p.description,
      image: p.image,
      category: p.category,
      sales_count: 0,
      discount: p.discount ? parseFloat(p.discount) : 0,
      created_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from('products').insert([productPayload]).select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      saveProductLocally(productPayload);
      return productPayload;
    }
  },
  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      // Also remove from local cache if present
      try {
        const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
        const filtered = localProducts.filter((p: any) => p.id !== id);
        localStorage.setItem('dropshippro_mock_products', JSON.stringify(filtered));
      } catch {}
    } catch (e) {
      // If Supabase delete failed, fall back to removing local persisted product
      const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
      const filtered = localProducts.filter((p: any) => p.id !== id);
      localStorage.setItem('dropshippro_mock_products', JSON.stringify(filtered));
      console.warn('deleteProduct fallback to localStorage due to error:', e);
    }
  },
  updateProduct: async (id: string, updates: any) => {
    const updatePayload = {
      name: updates.name,
      price: parseFloat(updates.price),
      description: updates.description,
      image: updates.image,
      category: updates.category,
      discount: updates.discount ? parseFloat(updates.discount) : 0
    };
    try {
      const { data, error } = await supabase.from('products').update(updatePayload).eq('id', id).select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      const localProducts = JSON.parse(localStorage.getItem('dropshippro_mock_products') || '[]');
      const productIndex = localProducts.findIndex((p: any) => p.id === id);
      if (productIndex !== -1) {
        localProducts[productIndex] = { ...localProducts[productIndex], ...updatePayload };
        localStorage.setItem('dropshippro_mock_products', JSON.stringify(localProducts));
      }
      return { id, ...updatePayload };
    }
  },
  createStaffAccount: async (email: string, username: string, password: string) => {
    const payload = {
      id: `STAFF-${Math.random().toString(36).substr(2,9).toUpperCase()}`,
      email,
      username,
      password,
      created_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from('staff_accounts').insert([payload]).select();
      if (error) throw error;
      return data[0] || payload;
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('dropshippro_staff_accounts') || '[]');
      local.push(payload);
      localStorage.setItem('dropshippro_staff_accounts', JSON.stringify(local));
      return payload;
    }
  },
  sendContactMessage: async (contactData: { name: string, email: string, subject: string, message: string }) => {
    // Validate and sanitize inputs
    if (!validateEmail(contactData.email)) {
      throw new Error('Invalid email format');
    }
    
    const sanitizedData = {
      name: sanitizeInput(contactData.name),
      email: contactData.email.toLowerCase().trim(),
      subject: sanitizeInput(contactData.subject),
      message: sanitizeInput(contactData.message)
    };

    if (!sanitizedData.name || sanitizedData.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!sanitizedData.subject || sanitizedData.subject.length < 3) {
      throw new Error('Subject must be at least 3 characters');
    }
    if (!sanitizedData.message || sanitizedData.message.length < 10) {
      throw new Error('Message must be at least 10 characters');
    }

    const messagePayload = {
      id: `MSG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      created_at: new Date().toISOString()
    };
    try {
      await supabase.from('contact_messages').insert([messagePayload]).select();
      try {
        await emailjs.send('service_mp3u1vk', 'template_ltzt0yi', {
          to_email: 'triship772@gmail.com',
          name: sanitizedData.name,
          time: messagePayload.created_at,
          from_name: sanitizedData.name,
          from_email: sanitizedData.email,
          subject: sanitizedData.subject,
          message: sanitizedData.message
        });
        return { success: true, messageId: messagePayload.id, emailSent: true };
      } catch {
        return { success: true, messageId: messagePayload.id, emailSent: false };
      }
    } catch (dbError) {
      const localMessages = JSON.parse(localStorage.getItem('dropshippro_contact_messages') || '[]');
      localMessages.push(messagePayload);
      localStorage.setItem('dropshippro_contact_messages', JSON.stringify(localMessages));
      return { success: true, messageId: messagePayload.id };
    }
  },
  sendStaffInvitation: async (staffEmail: string, username: string, password: string) => {
    try {
      const account = await api.createStaffAccount(staffEmail, username, password);
      
      // Attempt to send staff invitation email using EmailJS
      try {
        const nameForTemplate = username || staffEmail.split('@')[0];
        await emailjs.send('service_mp3u1vk', 'template_zxzuf8q', {
          name: nameForTemplate,
          username,
          password,
          email: staffEmail
        });
        return { success: true, accountId: account.id, emailSent: true };
      } catch (emailErr) {
        console.warn('Staff account created but email sending failed. Credentials:', {
          email: staffEmail,
          username: username,
          password: password
        }, emailErr);
        return {
          success: true,
          accountId: account.id,
          emailSent: false,
          note: 'Please manually inform staff with username and password above'
        };
      }
    } catch (err) {
      throw err;
    }
  }
};
