$(document).ready(function() {
  
  $("#editBtn").click(function() {
    window.location.href = "/admin/organization/" + orgId + "/edit";
  });

  $("#backBtn").click(function() {
    window.location.href = "/admin/organization";
  });

});