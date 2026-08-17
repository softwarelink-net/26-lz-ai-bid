<template>
  <div class="grid lg:grid-cols-3 gap-4">
    <section class="lg:col-span-2 bg-white rounded-xl p-4 border shadow-sm">
      <h3 class="font-semibold">远程医疗数据接入与脱敏网关</h3>
      <p class="text-sm text-slate-500 mt-2">DICOM / HL7 / FHIR 实时接入，动态 PHI 掩码与哈希伪化 UID 输出。</p>
      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2">通道</th><th>吞吐</th><th>状态</th><th>最近同步</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b"><td class="py-2">DICOM C-STORE</td><td>124 msg/min</td><td class="text-emerald-600">ONLINE</td><td>17:01:24</td></tr>
            <tr class="border-b"><td class="py-2">HL7 ADT</td><td>58 msg/min</td><td class="text-emerald-600">ONLINE</td><td>17:01:19</td></tr>
            <tr><td class="py-2">FHIR Observation</td><td>42 msg/min</td><td class="text-amber-600">DEGRADED</td><td>17:00:47</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <aside class="bg-white rounded-xl p-4 border shadow-sm">
      <h3 class="font-semibold">PHI 脱敏审计</h3>
      <ul class="mt-3 text-sm space-y-2 text-slate-600">
        <li>patient_name -> SHA256(HASH_9B8F72A10D)</li>
        <li>id_number -> **************1234</li>
        <li>phone -> 138****3344</li>
      </ul>
      <button class="mt-4 w-full py-2 rounded-md bg-slate-900 text-white">导出合规证书</button>
    </aside>
  </div>
</template>
