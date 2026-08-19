# 🌴 Coastal Farm Island 3D (Coastal World Style)

เกม 3D WebGL ทำฟาร์มและสำรวจเกาะชายฝั่ง สไตล์ **Coastal World (Merci-Michel)** พัฒนาด้วย Three.js + Tone.js + Supabase

---

## 🚀 ฟีเจอร์หลักในเกม
1. **Title Screen & Cinematic Swoop**: มุมกล้องหมุนรอบเกาะ และบินลงมาสู่ตัวละครแบบภาพยนตร์
2. **Playable 3D Character**: บังคับตัวละครเดิน/วิ่งด้วย `WASD` / `ปุ่มลูกศร` หรือ `Virtual Joystick` บนมือถือ
3. **ระบบทำฟาร์ม 3D**: ปลูกพืช 4 ชนิด (มะเขือเทศ, แครอท, กะหล่ำปลี, ข้าวโพด) พร้อมแอนิเมชันโตทีละขั้น
4. **หุ่นยนต์ผู้ช่วยรดน้ำ & Quiz**: ตอบคำถามคณิตศาสตร์เพื่อรับบัฟน้ำเร่งการเจริญเติบโต 1.6x
5. **ตลาดริมท่าเรือ**: ขายผลผลิตแลกเหรียญทอง
6. **ระบบเควส**: ทำภารกิจบนเกาะเพื่อรับเหรียญรางวัลพิเศษ
7. **Supabase Cloud Save**: รองรับการ Login ด้วย Google และบันทึกข้อมูลบน Cloud

---

## 🗄️ SQL Script สำหรับสร้างตารางบน Supabase

คัดลอกคำสั่ง SQL นี้ไปวางใน **Supabase -> SQL Editor** เพื่อสร้างตารางบันทึกข้อมูล:

```sql
create table public.game_saves (
    user_id uuid primary key references auth.users(id) on delete cascade,
    money int default 100,
    inventory jsonb default '{"tomato": 0, "carrot": 0, "cabbage": 0, "corn": 0}'::jsonb,
    unlocked_plots int default 6,
    barn_level int default 1,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- เปิดใช้งาน Row Level Security (RLS)
alter table public.game_saves enable row level security;

-- นโยบายให้ผู้เล่นอ่าน/เขียนได้เฉพาะข้อมูลของตัวเอง
create policy "Allow individual read" on public.game_saves for select using (auth.uid() = user_id);
create policy "Allow individual insert/update" on public.game_saves for all using (auth.uid() = user_id);
```

---

## 🌐 ขั้นตอนการ Deploy บน GitHub และ Vercel

1. **Push โค้ดขึ้น GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial Coastal Farm Island 3D"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy บน Vercel**:
   - ไปที่ [vercel.com](https://vercel.com) ➔ กด **Add New Project** ➔ เลือก GitHub Repository ของคุณ
   - Framework Preset: **Vite** หรือ **Other**
   - ใส่ Environment Variables สำหรับ Supabase (ถ้ามี):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - กด **Deploy**!
