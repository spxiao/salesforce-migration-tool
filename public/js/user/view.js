$(document).ready(function() {
  
  $("#editBtn").click(function() {
    window.location.href = "/admin/organization/" + orgId + "/user/" + userId + "/edit";
  });

  $("#backBtn").click(function() {
    window.location.href = "/admin/organization/" + orgId;
  });

});