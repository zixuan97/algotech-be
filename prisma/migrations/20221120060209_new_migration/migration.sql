-- CreateEnum
CREATE TYPE "DiscountCodeType" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT');

-- CreateEnum
CREATE TYPE "BulkOrderStatus" AS ENUM ('PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CREDIT_CARD', 'PAYNOW');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SENT', 'CANCELLED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'PAID', 'PREPARING', 'PREPARED', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('SHOPEE', 'SHOPIFY', 'LAZADA', 'REDMART', 'OTHERS', 'B2B');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INTERN', 'PARTTIME', 'FULLTIME', 'CUSTOMER', 'B2B');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "FulfilmentStatus" AS ENUM ('CREATED', 'ARRIVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('STANDARD', 'EXPRESS', 'PRIORITY');

-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('MANUAL', 'SHIPPIT', 'LALAMOVE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'CHILDCARE', 'COMPASSIONATE', 'PARENTAL', 'SICK', 'UNPAID');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('MCQ', 'TRUEFALSE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'FINISHED');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('COMPANY', 'POLICY', 'PROCESS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "company" TEXT,
    "contactNo" TEXT,
    "tier" TEXT,
    "managerId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "productId" INTEGER NOT NULL,
    "productSku" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "qtyThreshold" INTEGER,
    "brandId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockQuantity" (
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locationName" TEXT NOT NULL,

    CONSTRAINT "StockQuantity_pkey" PRIMARY KEY ("productId","locationId")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleProduct" (
    "bundleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productSku" TEXT NOT NULL,
    "bundleName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "BundleProduct_pkey" PRIMARY KEY ("productId","bundleId")
);

-- CreateTable
CREATE TABLE "ProcurementOrder" (
    "id" SERIAL NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfilmentStatus" "FulfilmentStatus" NOT NULL DEFAULT 'CREATED',
    "supplierId" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "warehouseAddress" TEXT NOT NULL,
    "supplierAddress" TEXT NOT NULL,
    "supplierEmail" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "warehouseName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "ProcurementOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementOrderItem" (
    "quantity" INTEGER NOT NULL,
    "procOrderId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProcurementOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "currency" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keys" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderBundleItem" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "salesOrderItemId" INTEGER NOT NULL,

    CONSTRAINT "SalesOrderBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "salesOrderId" INTEGER NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "customerContactNo" TEXT NOT NULL,
    "customerEmail" TEXT,
    "currency" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "platformType" "PlatformType" NOT NULL,
    "postalCode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "customerRemarks" TEXT,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PAID',
    "bulkOrderId" INTEGER,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkOrder" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "payeeName" TEXT NOT NULL,
    "payeeEmail" TEXT NOT NULL,
    "payeeRemarks" TEXT,
    "bulkOrderStatus" "BulkOrderStatus" NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "payeeContactNo" TEXT NOT NULL,
    "payeeCompany" TEXT,
    "discountCode" TEXT,
    "transactionAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BulkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emailSubject" TEXT NOT NULL,
    "emailBodyTitle" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "discountCode" TEXT NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCatalogue" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "productId" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProductCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleCatalogue" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "bundleId" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "BundleCatalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "totalSpent" DOUBLE PRECISION NOT NULL,
    "ordersCount" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "acceptsMarketing" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastOrderDate" TIMESTAMP(3) NOT NULL,
    "daysSinceLastPurchase" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryOrder" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "shippitTrackingNum" TEXT,
    "carrier" TEXT,
    "salesOrderId" INTEGER NOT NULL,
    "deliveryMode" "DeliveryMode" DEFAULT 'STANDARD',
    "shippingDate" TIMESTAMP(3),
    "shippingType" "ShippingType" NOT NULL DEFAULT 'MANUAL',
    "assignedUserId" INTEGER,
    "comments" TEXT,
    "eta" TIMESTAMP(3),

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryStatus" (
    "status" TEXT NOT NULL,
    "statusOwner" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "deliveryOrderId" INTEGER NOT NULL,

    CONSTRAINT "DeliveryStatus_pkey" PRIMARY KEY ("deliveryOrderId","date","timestamp","status")
);

-- CreateTable
CREATE TABLE "SupplierProduct" (
    "supplierId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SupplierProduct_pkey" PRIMARY KEY ("supplierId","productId")
);

-- CreateTable
CREATE TABLE "ScheduledNewsletter" (
    "id" SERIAL NOT NULL,
    "newsletterId" INTEGER NOT NULL,
    "customerEmails" TEXT[],
    "sentDate" TIMESTAMP(3) NOT NULL,
    "jobStatus" "JobStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledNewsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveApplication" (
    "id" SERIAL NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "commentsByVetter" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "vettedById" INTEGER,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveQuota" (
    "tier" TEXT NOT NULL,
    "annual" INTEGER NOT NULL,
    "childcare" INTEGER NOT NULL,
    "compassionate" INTEGER NOT NULL,
    "parental" INTEGER NOT NULL,
    "sick" INTEGER NOT NULL,
    "unpaid" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "LeaveQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLeaveRecord" (
    "employeeId" INTEGER NOT NULL,
    "annualQuota" INTEGER NOT NULL,
    "childcareQuota" INTEGER NOT NULL,
    "compassionateQuota" INTEGER NOT NULL,
    "parentalQuota" INTEGER NOT NULL,
    "sickQuota" INTEGER NOT NULL,
    "unpaidQuota" INTEGER NOT NULL,
    "annualBalance" INTEGER NOT NULL,
    "childcareBalance" INTEGER NOT NULL,
    "compassionateBalance" INTEGER NOT NULL,
    "parentalBalance" INTEGER NOT NULL,
    "sickBalance" INTEGER NOT NULL,
    "unpaidBalance" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "EmployeeLeaveRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" SERIAL NOT NULL,
    "topicOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "subjectOrder" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "subjectId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSubjectRecord" (
    "subjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "id" SERIAL NOT NULL,
    "lastAttemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeSubjectRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" "SubjectType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdatedById" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "subjectOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "passingScore" DOUBLE PRECISION NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "quizOrder" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL,
    "options" TEXT[],
    "quizId" INTEGER NOT NULL,
    "correctAnswer" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeQuizQuestionRecord" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeQuizQuestionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" SERIAL NOT NULL,
    "discountCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "customerEmails" TEXT[],
    "type" "DiscountCodeType" NOT NULL,
    "minOrderAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" SERIAL NOT NULL,
    "jobRole" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeSubjectRecordToQuiz" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeSubjectRecordToTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_JobRoleToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_name_key" ON "Bundle"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Keys_key_key" ON "Keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Keys_value_key" ON "Keys"("value");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderId_key" ON "SalesOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "BulkOrder_orderId_key" ON "BulkOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogue_productId_key" ON "ProductCatalogue"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleCatalogue_bundleId_key" ON "BundleCatalogue"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledNewsletter_jobId_key" ON "ScheduledNewsletter"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveQuota_tier_key" ON "LeaveQuota"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLeaveRecord_employeeId_key" ON "EmployeeLeaveRecord"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSubjectRecord_subjectId_userId_key" ON "EmployeeSubjectRecord"("subjectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_title_key" ON "Subject"("title");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeQuizQuestionRecord_questionId_userId_key" ON "EmployeeQuizQuestionRecord"("questionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_discountCode_key" ON "DiscountCode"("discountCode");

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_jobRole_key" ON "JobRole"("jobRole");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeSubjectRecordToQuiz_AB_unique" ON "_EmployeeSubjectRecordToQuiz"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeSubjectRecordToQuiz_B_index" ON "_EmployeeSubjectRecordToQuiz"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeSubjectRecordToTopic_AB_unique" ON "_EmployeeSubjectRecordToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeSubjectRecordToTopic_B_index" ON "_EmployeeSubjectRecordToTopic"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JobRoleToUser_AB_unique" ON "_JobRoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_JobRoleToUser_B_index" ON "_JobRoleToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuantity" ADD CONSTRAINT "StockQuantity_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuantity" ADD CONSTRAINT "StockQuantity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleProduct" ADD CONSTRAINT "BundleProduct_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleProduct" ADD CONSTRAINT "BundleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementOrderItem" ADD CONSTRAINT "ProcurementOrderItem_procOrderId_fkey" FOREIGN KEY ("procOrderId") REFERENCES "ProcurementOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderBundleItem" ADD CONSTRAINT "SalesOrderBundleItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogue" ADD CONSTRAINT "ProductCatalogue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleCatalogue" ADD CONSTRAINT "BundleCatalogue_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryStatus" ADD CONSTRAINT "DeliveryStatus_deliveryOrderId_fkey" FOREIGN KEY ("deliveryOrderId") REFERENCES "DeliveryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProduct" ADD CONSTRAINT "SupplierProduct_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledNewsletter" ADD CONSTRAINT "ScheduledNewsletter_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_vettedById_fkey" FOREIGN KEY ("vettedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLeaveRecord" ADD CONSTRAINT "EmployeeLeaveRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSubjectRecord" ADD CONSTRAINT "EmployeeSubjectRecord_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSubjectRecord" ADD CONSTRAINT "EmployeeSubjectRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeQuizQuestionRecord" ADD CONSTRAINT "EmployeeQuizQuestionRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeQuizQuestionRecord" ADD CONSTRAINT "EmployeeQuizQuestionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToQuiz" ADD CONSTRAINT "_EmployeeSubjectRecordToQuiz_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeSubjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToQuiz" ADD CONSTRAINT "_EmployeeSubjectRecordToQuiz_B_fkey" FOREIGN KEY ("B") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToTopic" ADD CONSTRAINT "_EmployeeSubjectRecordToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeSubjectRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeSubjectRecordToTopic" ADD CONSTRAINT "_EmployeeSubjectRecordToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToUser" ADD CONSTRAINT "_JobRoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobRoleToUser" ADD CONSTRAINT "_JobRoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
