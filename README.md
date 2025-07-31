Lab 5

### 3.3
App.vue
<div id="text-center font-sans text-gray-700 antialias">
text-center - Centers text horizontally within the element
font-sans - Applies a sans-serif font family (system default)
text-gray-700 - Sets text color to a medium gray shade
antialias - Applies font smoothing for better text rendering


EventlistView.vue
<div class="flex flex-col items-center">
flex - Makes the element a flexbox container
flex-col - Sets flex direction to column (vertical stacking)
items-center - Centers flex items along the cross-axis (horizontally in this case)


### 5
<div class="cursor-pointer border border-gray-600 p-4 w-64 mb-6 hover:scale-101 hover:shadow-sp">
cursor-pointer: เมื่อชี้เมาส์ไปที่กล่อง เมาส์จะเปลี่ยนเป็นรูปมือ (เหมือนกำลังชี้) บอกว่าคลิกได้

border border-gray-600: มีเส้นขอบสีเทาเข้มรอบๆ กล่อง

p-4: มีช่องว่างด้านใน (padding) รอบๆ ข้อความหรือเนื้อหา 4 หน่วย

w-64: กำหนดความกว้างของกล่องไว้ที่ 64 หน่วย

mb-6: มีช่องว่างด้านล่าง (margin-bottom) 6 หน่วย ทำให้มีระยะห่างจากองค์ประกอบถัดไป

hover:scale-101: เมื่อเอาเมาส์ไปชี้ กล่องจะขยายใหญ่ขึ้นเล็กน้อย (101% ของขนาดเดิม)

hover:shadow-sp: เมื่อเอาเมาส์ไปชี้ กล่องจะมีเงาขึ้นมา ซึ่ง shadow-sp นี้เป็นเงาแบบพิเศษที่ผู้สร้างโค้ดกำหนดขึ้นมาเองครับ